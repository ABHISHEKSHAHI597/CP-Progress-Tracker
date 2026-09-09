import axios from "axios";

const BASE_URL = "https://codeforces.com/api";

/**
 * Codeforces allows one request every two seconds per IP and answers 403 above
 * that. Every call in this process goes through one queue, so no combination of
 * jobs can push the server over the limit.
 */
const MIN_GAP_MS = 2100;
const MAX_ATTEMPTS = 4;
const REQUEST_TIMEOUT_MS = 30000;
const MAX_HANDLES_PER_CALL = 100;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

let queue = Promise.resolve();
let lastStartedAt = 0;

const isRetryable = (error) => {
  const status = error.response?.status;

  // No response at all means a network hiccup, which is worth another try.
  if (!error.response) return true;

  return status === 403 || status === 429 || status >= 500;
};

const commentOf = (error) =>
  error.cfComment || error.response?.data?.comment || null;

async function attempt(path, params) {
  for (let tries = 1; ; tries++) {
    try {
      const { data } = await axios.get(`${BASE_URL}/${path}`, {
        params,
        timeout: REQUEST_TIMEOUT_MS,
      });

      if (data.status !== "OK") {
        const failure = new Error(data.comment || "Codeforces returned FAILED");
        failure.cfComment = data.comment;
        throw failure;
      }

      return data.result;
    } catch (error) {
      // A 400 is a complaint about the arguments. Retrying cannot fix it.
      if (error.response?.status === 400) {
        const failure = new Error(commentOf(error) || "Codeforces rejected the request");
        failure.cfComment = commentOf(error);
        failure.status = 400;
        throw failure;
      }

      if (tries >= MAX_ATTEMPTS || !isRetryable(error)) throw error;

      await sleep(MIN_GAP_MS * 2 ** tries);
    }
  }
}

function request(path, params) {
  const run = async () => {
    const wait = MIN_GAP_MS - (Date.now() - lastStartedAt);
    if (wait > 0) await sleep(wait);

    lastStartedAt = Date.now();

    return attempt(path, params);
  };

  const result = queue.then(run, run);

  queue = result.then(
    () => {},
    () => {}
  );

  return result;
}

const chunk = (items, size) => {
  const groups = [];

  for (let i = 0; i < items.length; i += size) {
    groups.push(items.slice(i, i + size));
  }

  return groups;
};

/** Codeforces names the offending handle when it rejects a batch. */
function findRejectedHandle(comment, handles) {
  if (!comment) return null;

  const named = /handle\s+(\S+?)\s+not found/i.exec(comment)?.[1];

  if (named) {
    const match = handles.find(
      (handle) => handle.toLowerCase() === named.toLowerCase().replace(/[.,]$/, "")
    );

    if (match) return match;
  }

  return handles.find((handle) => comment.includes(handle)) || null;
}

async function fetchProfileGroup(group) {
  let remaining = [...group];
  const missing = [];

  while (remaining.length) {
    try {
      const profiles = await request("user.info", { handles: remaining.join(";") });
      return { profiles, missing };
    } catch (error) {
      if (error.status !== 400) throw error;

      const rejected = findRejectedHandle(commentOf(error), remaining);

      // A 400 we cannot attribute to one handle is not something to loop on.
      if (!rejected) throw error;

      missing.push(rejected);
      remaining = remaining.filter((handle) => handle !== rejected);
    }
  }

  return { profiles: [], missing };
}

/**
 * Profiles for a whole roster in a single request. Handles that no longer
 * exist on Codeforces come back in `missing` rather than failing the batch.
 */
export async function getUserInfos(handles) {
  const profiles = [];
  const missing = [];

  for (const group of chunk(handles, MAX_HANDLES_PER_CALL)) {
    const result = await fetchProfileGroup(group);

    profiles.push(...result.profiles);
    missing.push(...result.missing);
  }

  return { profiles, missing };
}

export async function getUserInfo(handle) {
  const [profile] = await request("user.info", { handles: handle });
  return profile;
}

/** Omit `count` to pull the entire submission history. */
export function getUserStatus(handle, { from, count } = {}) {
  return request("user.status", count ? { handle, from: from || 1, count } : { handle });
}

export function getUserRatingHistory(handle) {
  return request("user.rating", { handle });
}
