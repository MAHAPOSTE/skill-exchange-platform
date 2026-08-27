import express from "express";
import cors from "cors";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import skillRoutes from "./routes/skillRoutes.js";
import mentorRequestRoutes from "./routes/mentorRequestRoutes.js";

import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const port = process.env.PORT;
connectDB();

app.get("/", (req, res) => {
  res.send("Skill Exchange Platform API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/skills", skillRoutes);
app.use("/api/mentor-requests", mentorRequestRoutes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});