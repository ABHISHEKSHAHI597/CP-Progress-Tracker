import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import path from "path";
import Admin from "./src/models/Admin.js";

dotenv.config();

await mongoose.connect(
  process.env.MONGODB_URI
);

const hashedPassword =
  await bcrypt.hash(
    "vidyans@b24",
    10
  );

await Admin.create({
  username: "vidyans",
  password: hashedPassword,
});

console.log(
  "Admin Created Successfully"
);

process.exit();