const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const authMiddleware = require("../middleware/authMiddleware");

// ADD getProfile and updateProfile TO THIS LIST:
const {
  register,
  login,
  sendOTP,
  verifyOTP,
  getProfile,    // <--- Add this
  updateProfile, // <--- Add this
  getUserProfileById,
} = require("../controllers/authController");

router.post("/register", upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "govtIdPhoto", maxCount: 1 }
]), register);

router.post("/login", login);
router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);

// Profile Routes
router.get("/profile", authMiddleware, getProfile);
router.put("/profile/update", authMiddleware, updateProfile);
router.get("/profile/:id", authMiddleware, getUserProfileById);

module.exports = router;