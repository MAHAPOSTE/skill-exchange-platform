import dotenv from "dotenv";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "./models/userModel.js";

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.DATABASE_URL);

    console.log("Database connected");

    // Check if an admin already exists
    const existingAdmin = await User.findOne({ role: "admin" });

    if (existingAdmin) {
      console.log("Admin already exists");
      console.log("Admin email:", existingAdmin.email);
      process.exit(0);
    }

    // Check if the configured admin email already exists
    const existingUser = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingUser) {
      console.log(
        "This email already belongs to an existing user:",
        existingUser.email
      );
      console.log("Please choose a different ADMIN_EMAIL in .env");
      process.exit(1);
    }

    // Hash admin password
    const hashedPassword = await bcrypt.hash(
      process.env.ADMIN_PASSWORD,
      10
    );

    // Create admin
    const admin = await User.create({
      name: process.env.ADMIN_NAME,
      email: process.env.ADMIN_EMAIL,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully!");
    console.log("Name:", admin.name);
    console.log("Email:", admin.email);
    console.log("Role:", admin.role);

    process.exit(0);
  } catch (error) {
    console.error("Error creating admin:", error.message);
    process.exit(1);
  }
};

createAdmin();