import dotenv from "dotenv";

dotenv.config();

import connectDB from "./src/db/connectDB.js";
import app from "./src/app.js";

const PORT = process.env.PORT || 5000;

connectDB();

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});