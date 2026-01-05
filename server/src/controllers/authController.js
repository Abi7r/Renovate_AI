const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");
const User = require("../models/User");
const {
  sendWelcomeEmail,
  notifyAdminNewUser,
} = require("../services/emailServices");

exports.register = async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      phone: phone || "",
    });
    sendWelcomeEmail(user.name, user.email).catch((err) => {
      console.log("failed to send welcome email:", err);
    });
    notifyAdminNewUser(user.name, user.email).catch((err) => {
      console.log("failed to notify admin about new user:", err);
    });
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile || {},
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("Error while registering", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile: user.profile || {},
      token: generateToken(user._id),
    });
  } catch (error) {
    console.log("Error while registering", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    console.log("Current user /api/me", req.user);
    const user = await User.findById(req.user._id).select("-password");
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      profile: user.profile || {},
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
