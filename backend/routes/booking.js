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
router.patch("/:id/accept", acceptBooking);
router.patch("/:id/reject", rejectBooking);
router.patch("/:id/cancel", cancelBooking);

module.exports = router;
