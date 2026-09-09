import cron from "node-cron";

import {
  repairStaleUsers,
  syncProfiles,
  syncRatingHistories,
  syncSubmissions,
} from "../services/sync.service.js";

/**
 * Three jobs at three cadences, because the data moves at three speeds.
 *
 *   profiles     one request for the whole roster, so it can run often
 *   submissions  one small page per person, only what is new since last time
 *   repair       a slow full rebuild of the oldest handles, to catch rejudges
 *
 * Contest history is not on a timer at all. It is fetched only for handles
 * whose rating moved, which the profile tick reports.
 */
const PROFILE_SCHEDULE = "*/5 * * * *";
const SUBMISSION_SCHEDULE = "*/30 * * * *";
const REPAIR_SCHEDULE = "23 * * * *";

const running = new Set();

/** A slow run must never stack on top of itself. */
async function once(name, job) {
  if (running.has(name)) {
    console.log(`Skipped ${name}: previous run still going`);
    return;
  }

  running.add(name);

  const startedAt = Date.now();

  try {
    const summary = await job();
    const seconds = ((Date.now() - startedAt) / 1000).toFixed(1);

    console.log(`${name} finished in ${seconds}s`, summary ?? "");
  } catch (error) {
    console.log(`${name} failed: ${error.message}`);
  } finally {
    running.delete(name);
  }
}

const refreshProfiles = () =>
  once("profiles", async () => {
    const { checked, ratingChanged, missing } = await syncProfiles();

    if (missing.length) {
      console.log(`Handles no longer on Codeforces: ${missing.join(", ")}`);
    }

    const updated = ratingChanged.length
      ? await syncRatingHistories(ratingChanged)
      : 0;

    return { checked, ratingHistories: updated };
  });

const refreshSubmissions = () => once("submissions", () => syncSubmissions());

const repair = () => once("repair", async () => ({
  repaired: await repairStaleUsers(),
}));

export const startCronJob = async () => {
  // One request, so a restart costs almost nothing.
  await refreshProfiles();

  cron.schedule(PROFILE_SCHEDULE, refreshProfiles);
  cron.schedule(SUBMISSION_SCHEDULE, refreshSubmissions);
  cron.schedule(REPAIR_SCHEDULE, repair);

  console.log("Refresh jobs scheduled");
};
