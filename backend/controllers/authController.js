const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

// Temporary storage for OTPs
const otpStore = {};

// Email Configuration
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify Mail Server Connection
transporter.verify((error, success) => {
  if (error) {
    console.log("❌ Mail Server Error:", error.message);
  } else {
    console.log("✅ Mail Server is ready to send OTPs");
  }
});

// --- 1. SEND OTP ---
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json("Email is required");

    // Check if user already exists before sending OTP
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json("Email already registered");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 300000 }; // 5 mins expiry

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Verification OTP - Rental Manager",
      text: `Your OTP for registration is: ${otp}`,
    });

    res.json("OTP sent successfully");
  } catch (err) {
    console.log("OTP ERROR:", err);
    res.status(500).json("Error sending email");
  }
};

// --- 2. VERIFY OTP ---
exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;
  const storedData = otpStore[email];

  if (
    !storedData ||
    storedData.otp !== otp ||
    Date.now() > storedData.expires
  ) {
    return res.status(400).json("Invalid or expired OTP");
  }

  // Mark as verified so they can proceed to Step 3
  storedData.verified = true;
  res.json("OTP verified");
};

// --- 3. REGISTER ---
exports.register = async (req, res) => {
  try {
    let { name, email, password, role } = req.body;

    // Clean inputs
    name = name?.trim();
    email = email?.trim();
    password = password?.trim();

    if (!name || !email || !password) {
      return res.status(400).json("All fields are required");
    }

    // Ensure they actually verified the OTP for this specific email
    if (!otpStore[email] || !otpStore[email].verified) {
      return res.status(400).json("Please verify your email first");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role: role || "tenant",
    });

    await user.save();

    // Clear the OTP from memory after successful registration
    delete otpStore[email];

    res.status(201).json("User Registered Successfully");
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json("Registration failed");
  }
};

// --- 4. LOGIN ---
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json("All fields required");

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid password");

    // Update login tracking
    user.lastLogin = new Date();
    user.loginCount = (user.loginCount || 0) + 1;
    await user.save();

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.status(200).json({
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
      },
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    res.status(500).json("Server Error");
  }
};
