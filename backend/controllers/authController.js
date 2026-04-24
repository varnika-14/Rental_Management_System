const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const Property = require("../models/Property");
const Booking = require("../models/Booking");
const Message = require("../models/Message");
const Conversation = require("../models/Conversation");
const otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Mail Server Error:", error.message);
  } else {
    console.log("Mail Server is ready to send OTPs");
  }
});

exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json("Email is required");

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json("Email already registered");

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore[email] = { otp, expires: Date.now() + 300000 };

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

  storedData.verified = true;
  res.json("OTP verified");
};

exports.register = async (req, res) => {
  try {
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
      phonenumber,
      permanentAddress,
      emergencyContact,
    } = req.body;

    if (
      !name ||
      !email ||
      !password ||
      !age ||
      !govtIdNumber ||
      !upiId ||
      !bankDetails ||
      !permanentAddress ||
      !phonenumber ||
      !emergencyContact
    ) {
      return res.status(400).json("All text fields are required");
    }

    if (!otpStore[email] || !otpStore[email].verified) {
      return res.status(400).json("Please verify your email first");
    }

    if (!req.files || !req.files["profilePhoto"] || !req.files["govtIdPhoto"]) {
      return res
        .status(400)
        .json("Both Profile Photo and Govt ID Photo are mandatory");
    }

    const profilePhotoUrl = req.files["profilePhoto"][0].path;
    const govtIdPhotoUrl = req.files["govtIdPhoto"][0].path;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password.trim(), salt);

    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role: role || "tenant",
      age,
      qualification,
      occupation,
      permanentAddress,
      emergencyContact,
      salary,
      govtIdNumber,
      upiId,
      bankDetails,
      phonenumber,
      profilePhoto: profilePhotoUrl,
      govtIdPhoto: govtIdPhotoUrl,
    });

    await user.save();

    delete otpStore[email];

    res.status(201).json("User Registered Successfully");
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json("Registration failed: " + err.message);
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return res.status(400).json("All fields required");

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json("User not found");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json("Invalid password");

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

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).json("Error fetching profile");
  }
};

exports.getUserProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json("User not found");
    res.json(user);
  } catch (err) {
    res.status(500).json("Error fetching user profile");
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
      "phonenumber",
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

exports.getDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Count unread messages - messages not sent by current user and not read by current user
    const conversations = await Conversation.find({
      $or: [
        { owner: userId },
        { tenant: userId }
      ]
    }).select('_id');
    
    const conversationIds = conversations.map(conv => conv._id);
    
    const unreadCount = await Message.countDocuments({
      conversation: { $in: conversationIds },
      $and: [
        { sender: { $ne: userId } }, // Not sent by current user
        { readBy: { $ne: userId } } // Not read by current user
      ]
    });

    let stats = {
      unreadMessages: unreadCount,
    };

    if (userRole === "owner") {
      // Owner stats
      const totalListings = await Property.countDocuments({ owner: userId });
      
      // Booking requests for owner's properties
      const bookingRequests = await Booking.countDocuments({
        owner: userId,
        status: "pending"
      });

      stats = {
        ...stats,
        primaryLabel: "My Listings",
        primaryValue: totalListings,
        bookingRequests: bookingRequests,
        status: "Verified",
      };
    } else {
      // Tenant stats
      const totalBookings = await Booking.countDocuments({ tenant: userId });
      
      // Count bookings by status
      const acceptedBookings = await Booking.countDocuments({
        tenant: userId,
        status: "accepted"
      });
      const pendingBookings = await Booking.countDocuments({
        tenant: userId,
        status: "pending"
      });

      stats = {
        ...stats,
        primaryLabel: "My Bookings",
        primaryValue: totalBookings,
        acceptedBookings: acceptedBookings,
        pendingBookings: pendingBookings,
        status: "Verified",
      };
    }

    res.status(200).json(stats);
  } catch (error) {
    console.error("Stats Error:", error);
    res.status(500).json({ message: "Error fetching stats" });
  }
};
