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
  getAcceptedBookingsByProperty,
  getRentTracking,
} = require("../controllers/bookingController");

router.use(auth);

router.post("/request", createBookingRequest);
router.get("/requests", getOwnerBookingRequests);
router.get("/my-bookings", getTenantBookings);
router.get("/rent-tracking", getRentTracking);
router.patch("/:id/accept", acceptBooking);
router.patch("/:id/reject", rejectBooking);
router.patch("/:id/cancel", cancelBooking);

router.get("/property/:propertyId/accepted", getAcceptedBookingsByProperty);

module.exports = router;
