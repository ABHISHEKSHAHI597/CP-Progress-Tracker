const DAY_MS = 24 * 60 * 60 * 1000;

// Returns the next `count` future occurrences of a fixed weekly slot (UTC-based).
export const getNextWeeklyOccurrences = ({
  dayOfWeek, // 0 = Sunday ... 6 = Saturday
  hourUTC,
  minuteUTC,
  count = 4,
}) => {
  const now = new Date();
  let next = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      hourUTC,
      minuteUTC,
      0
    )
  );

  while (next.getUTCDay() !== dayOfWeek || next.getTime() <= now.getTime()) {
    next = new Date(next.getTime() + DAY_MS);
  }

  const occurrences = [];
  for (let i = 0; i < count; i++) {
    occurrences.push(new Date(next.getTime() + i * 7 * DAY_MS));
  }

  return occurrences;
};

// Returns the next `count` future occurrences of a fixed biweekly slot,
// anchored to a known past/future occurrence so the parity (which week) is correct.
export const getNextBiweeklyOccurrences = ({ anchorDateUTC, count = 2 }) => {
  const now = new Date();
  const anchor = new Date(anchorDateUTC);
  const intervalMs = 14 * DAY_MS;

  const steps = Math.ceil((now.getTime() - anchor.getTime()) / intervalMs);
  let next = new Date(anchor.getTime() + steps * intervalMs);

  while (next.getTime() <= now.getTime()) {
    next = new Date(next.getTime() + intervalMs);
  }

  const occurrences = [];
  for (let i = 0; i < count; i++) {
    occurrences.push(new Date(next.getTime() + i * intervalMs));
  }

  return occurrences;
};