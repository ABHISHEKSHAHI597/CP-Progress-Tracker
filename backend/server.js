import { NODE_ENV, PORT } from "./src/config/env.js";

import app from "./src/app.js";
import connectDB from "./src/db/connectDB.js";
import { startCronJob } from "./src/cron/refreshUsers.js";

connectDB();

app.listen(PORT, () => {
  console.log(`Server running in ${NODE_ENV} mode on http://localhost:${PORT}`);

  startCronJob();
});
