#!/usr/bin/env bash
#
# Starts the CP Progress Tracker: the API, the web app, and your browser.
#
#   ./script.sh          development — hot reload on both sides
#   ./script.sh prod     production  — built frontend, NODE_ENV=production API
#
set -euo pipefail
set -m   # give each background job its own process group so cleanup is total

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$ROOT"

MODE="${1:-dev}"

case "$MODE" in
  dev|development) MODE="dev" ;;
  prod|production) MODE="prod" ;;
  -h|--help)
    sed -n '2,8p' "$0" | sed 's/^# \{0,1\}//'
    exit 0
    ;;
  *)
    echo "Unknown mode \"$MODE\". Use \"dev\" or \"prod\"." >&2
    exit 1
    ;;
esac

# ── output ────────────────────────────────────────────────────────────────
if [ -t 1 ]; then
  DIM=$'\033[2m'; BOLD=$'\033[1m'; RED=$'\033[31m'; GREEN=$'\033[32m'; OFF=$'\033[0m'
else
  DIM=""; BOLD=""; RED=""; GREEN=""; OFF=""
fi

step() { printf '%s▸%s %s\n' "$BOLD" "$OFF" "$1"; }
warn() { printf '%s!%s %s\n' "$RED" "$OFF" "$1" >&2; }
note() { printf '  %s%s%s\n' "$DIM" "$1" "$OFF"; }

# ── prerequisites ─────────────────────────────────────────────────────────
for tool in node npm; do
  command -v "$tool" >/dev/null 2>&1 || {
    warn "$tool is not installed. Install Node.js 20.19 or newer and run this again."
    exit 1
  }
done

NODE_MAJOR="$(node -p 'process.versions.node.split(".")[0]')"

if [ "$NODE_MAJOR" -lt 20 ]; then
  warn "Node.js $(node -v) is too old. Vite 8 needs 20.19 or newer."
  exit 1
fi

# ── environment files ─────────────────────────────────────────────────────
step "Checking environment files"

if [ ! -f backend/.env ]; then
  cp backend/.env.example backend/.env
  warn "Created backend/.env from the example. Fill in MONGODB_URI and JWT_SECRET, then run this again."
  note "ENV.md lists what every value should be."
  exit 1
fi

for pair in "frontend/.env.development" "frontend/.env.production"; do
  [ -f "$pair" ] || cp frontend/.env.example "$pair"
done

if grep -q '<' backend/.env 2>/dev/null; then
  warn "backend/.env still has placeholder values in angle brackets. Fill them in first."
  exit 1
fi

# ── ports ─────────────────────────────────────────────────────────────────
env_value() { grep -m1 "^$2=" "$1" 2>/dev/null | cut -d= -f2- | tr -d "\"' \r"; }

API_PORT="$(env_value "backend/.env.$( [ "$MODE" = prod ] && echo production || echo development )" PORT)"
API_PORT="${API_PORT:-5000}"

WEB_PORT=$([ "$MODE" = prod ] && echo 4173 || echo 3000)
WEB_URL="http://localhost:$WEB_PORT"

# ── dependencies ──────────────────────────────────────────────────────────
for dir in backend frontend; do
  if [ ! -d "$dir/node_modules" ]; then
    step "Installing $dir dependencies"
    (cd "$dir" && npm install --no-audit --no-fund)
  fi
done

# ── shutdown ──────────────────────────────────────────────────────────────
PIDS=()

cleanup() {
  trap - INT TERM EXIT
  printf '\n'
  step "Stopping"

  for pid in "${PIDS[@]:-}"; do
    [ -n "$pid" ] && kill -- -"$pid" 2>/dev/null || true
  done

  wait 2>/dev/null || true
  exit 0
}

trap cleanup INT TERM EXIT

# Vite binds to ::1 only, so try the name before the IPv4 literal.
wait_for_port() {
  local port="$1" label="$2" tries=0 host

  while [ "$tries" -lt 120 ]; do
    for host in localhost 127.0.0.1; do
      if (exec 3<>"/dev/tcp/$host/$port") 2>/dev/null; then
        exec 3<&- 3>&-
        return 0
      fi
    done

    tries=$((tries + 1))
    sleep 0.5
  done

  warn "$label did not come up on port $port. Scroll up for its output."
  return 1
}

# ── build, in production only ─────────────────────────────────────────────
if [ "$MODE" = prod ]; then
  step "Building the frontend"
  (cd frontend && npm run build)
fi

# ── the API ───────────────────────────────────────────────────────────────
step "Starting the API on port $API_PORT"

API_SCRIPT=$([ "$MODE" = prod ] && echo start:prod || echo dev)

(cd backend && npm run "$API_SCRIPT") > >(sed -u "s/^/${DIM}api${OFF}  /") 2>&1 &
PIDS+=("$!")

wait_for_port "$API_PORT" "The API"

# ── the web app ───────────────────────────────────────────────────────────
step "Starting the web app on port $WEB_PORT"

WEB_SCRIPT=$([ "$MODE" = prod ] && echo preview || echo dev)

(cd frontend && npm run "$WEB_SCRIPT") > >(sed -u "s/^/${DIM}web${OFF}  /") 2>&1 &
PIDS+=("$!")

wait_for_port "$WEB_PORT" "The web app"

# ── browser ───────────────────────────────────────────────────────────────
open_browser() {
  if command -v xdg-open >/dev/null 2>&1; then xdg-open "$1" >/dev/null 2>&1 &
  elif command -v open >/dev/null 2>&1; then open "$1" >/dev/null 2>&1 &
  elif command -v start >/dev/null 2>&1; then start "$1" >/dev/null 2>&1 &
  else note "Open $1 in your browser."
  fi
}

if [ "${NO_OPEN:-}" != "1" ]; then
  open_browser "$WEB_URL"
fi

printf '\n%s✓%s  %s running\n' "$GREEN" "$OFF" "$([ "$MODE" = prod ] && echo Production || echo Development)"
note "web  $WEB_URL"
note "api  http://localhost:$API_PORT/health"
note "Press Ctrl-C to stop both."
printf '\n'

wait
