import dotenv from "dotenv";
dotenv.config();

import app from "./src/app.js";
import connectDB from "./src/db/connectDB.js";

import {
  startCronJob,
} from "./src/cron/refreshUsers.js";

connectDB();

app.listen(5000, () => {
  console.log("Server running on port 5000");

  startCronJob();
});