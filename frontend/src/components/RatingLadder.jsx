import { useEffect, useRef, useState } from "react";
import { BANDS, tierOf } from "../lib/rank";

const AXIS_SPACE = 34; // room below the markers for the band and its ticks
const LABEL_LANE = 21;
const SWARM_LANE = 11;
const LABEL_LIMIT = 12; // above this many people, labels stop fitting

/**
 * Everyone tracked, placed on the Codeforces rating axis over the tier bands.
 * It answers the question the group actually asks — who is where, and how far
 * apart are we — in one glance. Small groups get handles; larger ones become a
 * distribution, with the roster below supplying the names.
 */
function RatingLadder({ users }) {
  const wrapRef = useRef(null);
  const [width, setWidth] = useState(720);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node) return;

    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const rated = users
    .map((user) => ({ ...user, value: user.rating || user.maxRating }))
    .filter((user) => user.value)
    .sort((a, b) => a.value - b.value);

  if (rated.length === 0) return null;

  // The axis frames the group, not the whole 0–3500 scale nobody occupies.
  const lowest = rated[0].value;
  const highest = rated[rated.length - 1].value;

  const low = Math.max(0, Math.floor((lowest - 150) / 100) * 100);
  const high = Math.min(3500, Math.ceil((highest + 150) / 100) * 100);
  const span = high - low || 1;

  const percent = (value) => ((Math.min(Math.max(value, low), high) - low) / span) * 100;

  const showLabels = rated.length <= LABEL_LIMIT;
  const lane = showLabels ? LABEL_LANE : SWARM_LANE;

  const lanes = [];
  const placed = rated.map((user) => {
    const halfWidth = showLabels ? (user.handle.length * 6.7 + 16) / 2 : 6;
    const centre = (percent(user.value) / 100) * width;

    let index = lanes.findIndex((edge) => centre - halfWidth > edge);
    if (index === -1) index = lanes.length;

    lanes[index] = centre + halfWidth;

    return { ...user, lane: index };
  });

  const height = AXIS_SPACE + (showLabels ? 34 : 14) + Math.max(lanes.length - 1, 0) * lane + 8;

  const visibleBands = BANDS.map((band) => ({
    ...band,
    from: Math.max(band.from, low),
    to: Math.min(band.to, high),
  })).filter((band) => band.to > band.from);

  const ticks = [
    low,
    ...BANDS.map((band) => band.from).filter((value) => value > low + span * 0.06 && value < high - span * 0.06),
    high,
  ];

  const counts = new Map();
  rated.forEach((user) => {
    const tier = tierOf(user.value);
    counts.set(tier.label, {
      color: tier.color,
      count: (counts.get(tier.label)?.count || 0) + 1,
    });
  });

  return (
    <section aria-label="Rating ladder">
      <div className="overflow-x-auto pb-1">
        <div className={`px-7 ${showLabels ? "min-w-[560px]" : "min-w-[380px]"}`}>
          <div ref={wrapRef} className="relative" style={{ height }}>
            {placed.map((user, index) => {
              const tier = tierOf(user.value);
              const stem = user.lane * lane + (showLabels ? 10 : 4);

              return (
                <div
                  key={user._id || user.handle}
                  className="absolute flex flex-col-reverse items-center"
                  style={{
                    left: `${percent(user.value)}%`,
                    bottom: AXIS_SPACE,
                    animation: `settle 520ms cubic-bezier(.2,.7,.2,1) ${Math.min(index * 32, 700)}ms both`,
                  }}
                >
                  <span
                    className="w-px"
                    style={{
                      height: stem,
                      background: `linear-gradient(to top, ${tier.color}00, ${tier.color}77)`,
                    }}
                  />

                  <span
                    className="rounded-full"
                    style={{
                      height: 7,
                      width: 7,
                      background: tier.color,
                      boxShadow: `0 0 0 3px ${tier.color}22`,
                    }}
                    title={`${user.handle} — ${user.value}, ${tier.label}`}
                  />

                  {showLabels && (
                    <span
                      className="font-mono text-[11px] leading-none mb-2 whitespace-nowrap"
                      style={{ color: tier.color }}
                    >
                      {user.handle}
                      <span className="text-faint ml-1.5">{user.value}</span>
                    </span>
                  )}
                </div>
              );
            })}

            <div
              className="absolute inset-x-0 flex rounded-[3px] overflow-hidden"
              style={{ bottom: 26, height: 7 }}
            >
              {visibleBands.map((band) => (
                <span
                  key={band.from}
                  style={{
                    width: `${((band.to - band.from) / span) * 100}%`,
                    background: band.color,
                    opacity: 0.75,
                  }}
                />
              ))}
            </div>

            {ticks.map((value, index) => (
              <span
                key={value}
                className="absolute figure text-[11px] text-faint"
                style={{
                  left: `${percent(value)}%`,
                  bottom: 4,
                  transform:
                    index === 0
                      ? "none"
                      : index === ticks.length - 1
                        ? "translateX(-100%)"
                        : "translateX(-50%)",
                }}
              >
                {value}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-4 text-[12.5px]">
        {[...counts.entries()].map(([label, tier]) => (
          <span key={label} className="flex items-center gap-2">
            <span
              className="h-2 w-2 rounded-full shrink-0"
              style={{ background: tier.color }}
              aria-hidden="true"
            />
            <span className="text-mute">{label}</span>
            <span className="figure text-paper">{tier.count}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

export default RatingLadder;
