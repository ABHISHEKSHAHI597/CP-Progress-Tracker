import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import Admin from "../models/Admin.js";

export const loginAdmin = async (
  req,
  res
) => {
  try {
    const { username, password } =
      req.body;

    // Input validation
    if (
      typeof username !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({
        message: "Invalid input",
      });
    }

    if (
      username.trim() === "" ||
      password.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "Username and password are required",
      });
    }

    const admin =
      await Admin.findOne({
        username: username.trim(),
      });

    if (!admin) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const isMatch =
      await bcrypt.compare(
        password,
        admin.password
      );

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );

    return res.status(200).json({
      token,
    });
  } catch (error) {
    console.error(
      "Admin login error:",
      error
    );

    return res.status(500).json({
      message:
        "Internal server error",
    });
  }
};