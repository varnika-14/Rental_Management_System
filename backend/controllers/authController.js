const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
exports.register = async (req, res) => {
  try {
    console.log("BODY RECEIVED:", req.body);

    let { name, email, password, role } = req.body;

    name = name?.trim();
    email = email?.trim();
    password = password?.trim();

    if (!name || !email || !password) {
      return res.status(400).json("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json("Email already registered");
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

    res.status(201).json("User Registered Successfully");
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    res.status(500).json("Registration failed");
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
    user.loginCount = user.loginCount + 1;
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
        id: user._id,
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
