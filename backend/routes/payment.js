const express = require("express");
const router = express.Router();
const auth = require("../middleware/authMiddleware");
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  processPayment,
  getBookingPayments,
} = require("../controllers/paymentController");

router.use(auth);

router.post("/create-order", createPaymentOrder);
router.post("/verify", verifyPayment);
router.get("/history", getPaymentHistory);
router.get("/booking/:bookingId", getBookingPayments);
router.post("/process-payment", processPayment);
module.exports = router;
