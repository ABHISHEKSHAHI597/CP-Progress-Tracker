import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import { MONGODB_URI } from "./src/config/env.js";
import Admin from "./src/models/Admin.js";

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

if (!username || !password) {
  console.error(
    "Set ADMIN_USERNAME and ADMIN_PASSWORD in backend/.env, then run this again."
  );
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);

const existing = await Admin.findOne({ username });

if (existing) {
  existing.password = await bcrypt.hash(password, 10);
  await existing.save();

  console.log(`Password updated for admin "${username}".`);
} else {
  await Admin.create({
    username,
    password: await bcrypt.hash(password, 10),
  });

  console.log(`Admin "${username}" created.`);
}

process.exit();
