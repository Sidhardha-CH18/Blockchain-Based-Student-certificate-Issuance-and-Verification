const express = require("express");
const router = express.Router();
const User = require("../models/User");

// Signup API Route
router.post("/signup", async (req, res) => {
  const { address, role, name } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ address });
    if (existingUser) return res.status(400).json({ message: "User already exists." });

    // Save new user
    const newUser = new User({ address, role, name });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/login", async (req, res) => {
  const { address } = req.query;

  try {
    const user = await User.findOne({ address });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ role: user.role, name: user.name });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
