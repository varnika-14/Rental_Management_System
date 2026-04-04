const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

const {
  createBookingRequest,
  getTenantBookings,
  getOwnerBookingRequests,
  acceptBooking,
  rejectBooking,
  cancelBooking,
} = require("../controllers/bookingController");

// Apply authentication middleware to all routes
router.use(auth);

// Routes
router.post("/request", createBookingRequest);
router.get("/requests", getOwnerBookingRequests);
router.get("/my-bookings", getTenantBookings);
router.patch("/:bookingId/accept", acceptBooking);
router.patch("/:bookingId/reject", rejectBooking);
router.patch("/:bookingId/cancel", cancelBooking);

module.exports = router;
