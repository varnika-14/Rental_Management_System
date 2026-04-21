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
// --- 3. REGISTER (Updated with Cloudinary & Mandatory Fields) ---
exports.register = async (req, res) => {
  try {
    // Destructure all new mandatory fields from req.body
    const {
      name,
      email,
      password,
      role,
      age,
      qualification,
      occupation,
      salary,
      govtIdNumber,
      upiId,
      bankDetails,
      permanentAddress,
      emergencyContact,
    } = req.body;

    // Check for required text fields
    if (
      !name ||
      !email ||
      !password ||
      !age ||
      !govtIdNumber ||
      !upiId ||
      !bankDetails ||
      !permanentAddress ||
      !emergencyContact
    ) {
      return res.status(400).json("All text fields are required");
    }

    // Ensure they actually verified the OTP for this specific email
    if (!otpStore[email] || !otpStore[email].verified) {
      return res.status(400).json("Please verify your email first");
    }

    // Check if files were uploaded to Cloudinary via Multer
    if (!req.files || !req.files["profilePhoto"] || !req.files["govtIdPhoto"]) {
      return res
        .status(400)
        .json("Both Profile Photo and Govt ID Photo are mandatory");
    }

    // Cloudinary URLs provided by multer-storage-cloudinary
    const profilePhotoUrl = req.files["profilePhoto"][0].path;
    const govtIdPhotoUrl = req.files["govtIdPhoto"][0].path;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || "tenant",
      // New Mandatory Fields
      age,
      qualification,
      occupation,
      permanentAddress,
      emergencyContact,
      salary,
      govtIdNumber,
      upiId,
      bankDetails,
      // Photo URLs
      profilePhoto: profilePhotoUrl,
      govtIdPhoto: govtIdPhotoUrl,
    });

    await user.save();

    // Clear the OTP from memory after successful registration
    delete otpStore[email];

    res.status(201).json("User Registered Successfully");
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json("Registration failed: " + err.message);
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

// --- GET PROFILE ---
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).json("Error fetching profile");
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      "name",
      "age",
      "permanentAddress",
      "emergencyContact",
      "qualification",
      "occupation",
      "salary",
      "govtIdNumber",
      "upiId",
      "bankDetails",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true },
    ).select("-password");

    if (!updatedUser) return res.status(404).json("User not found");

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json("Update failed");
  }
};
