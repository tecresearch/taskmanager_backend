const router = require("express").Router();
const User = require("../models/user"); // Import the User model correctly
const bcrypt = require("bcryptjs");
const Joi = require("joi");
const jwt=require("jsonwebtoken");

// Register validation schema using Joi
const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

router.post("/register", async (req, res) => {
  // Validate the request body
  const { error } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, email, password } = req.body;

  try {
    // Check if the username or email already exists
    const existingUser = await User.findOne({ username });
    const existingEmail = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    if (existingEmail) {
      return res.status(400).json({ message: "Email is already registered." });
    }

    // Hash the password before saving it to the database
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create a new user
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    // Save the user
    await newUser.save();

    // Respond with success message and user info (without password)
    res.status(201).json({
      message: "User registered successfully",
      user: {
        username: newUser.username,
        email: newUser.email,
        _id: newUser._id,
      },
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

require('dotenv').config(); // Load environment variables
// JWT secret key 
const JWT_SECRET = process.env.JWT_SECRET || "BrijeshNishad150@gmail.com"; // Replace with a stronger secret in production

// Login validation schema using Joi (only username and password)
const loginSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).required(),
});

router.post("/login", async (req, res) => {
  // Validate the request body
  const { error } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Compare the provided password with the hashed password in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id, username: user.username },
      JWT_SECRET,
      { expiresIn: "1h" } // Set token expiration (1 hour in this case)
    );

    // Send the response with the token and user info (excluding password)
    res.status(200).json({
      message: "Login successful",
      token, // Send the JWT token to the client
      user: {
        username: user.username,
        _id: user._id,
      },
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
