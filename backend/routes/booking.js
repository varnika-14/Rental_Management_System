const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

// 1. Add the function name to this list
const {
  createBookingRequest,
  getTenantBookings,
  getOwnerBookingRequests,
  acceptBooking,
  rejectBooking,
  cancelBooking,
  getAcceptedBookingsByProperty, // <--- Add this here
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

// 2. Remove "bookingController." from here
router.get("/property/:propertyId/accepted", getAcceptedBookingsByProperty);

module.exports = router;
