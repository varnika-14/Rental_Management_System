const Payment = require("../models/Payment");
const Booking = require("../models/Booking");
const {
  getPaymentAmount,
  updateBookingPayment,
} = require("../utils/rentUtils");

async function getBookingForTenant(bookingId, userId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) return { error: { status: 404, message: "Booking not found" } };
  if (booking.tenant.toString() !== userId.toString()) {
    return { error: { status: 403, message: "Not authorized" } };
  }
  if (booking.status !== "accepted") {
    return {
      error: { status: 400, message: "Booking must be accepted before payment" },
    };
  }
  return { booking };
}

function validatePaymentInput(paymentDetails) {
  if (paymentDetails.paymentMethod === "upi") {
    const upi = (paymentDetails.name || "").trim().toLowerCase();
    if (!upi.includes("@")) {
      return { valid: false, message: "Enter a valid UPI ID" };
    }
    if (upi.includes("fail")) {
      return { valid: false, message: "Payment failed" };
    }
    return { valid: true };
  }

  const cardNumber = (paymentDetails.cardNumber || "").replace(/\s/g, "");
  if (cardNumber.length < 15) {
    return { valid: false, message: "Enter a valid card number" };
  }
  if (!paymentDetails.expiry || !paymentDetails.expiry.includes("/")) {
    return { valid: false, message: "Enter a valid expiry date" };
  }
  if (!paymentDetails.cvv || paymentDetails.cvv.length < 3) {
    return { valid: false, message: "Enter a valid CVV" };
  }
  if (!paymentDetails.name?.trim()) {
    return { valid: false, message: "Enter cardholder name" };
  }
  if (paymentDetails.cvv === "000") {
    return { valid: false, message: "Payment failed" };
  }

  return { valid: true };
}

exports.createPaymentOrder = async (req, res) => {
  try {
    const { bookingId, paymentType } = req.body;
    const userId = req.user._id || req.user.id;

    const { booking, error } = await getBookingForTenant(bookingId, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    const type = paymentType === "monthly" ? "monthly" : "one_time";
    const amount = getPaymentAmount(booking, type);

    if (amount <= 0) {
      return res.status(400).json({ message: "No payment due for this booking" });
    }

    const orderId = `ORDER_${Date.now()}_${bookingId}`;

    const payment = new Payment({
      bookingId,
      orderId,
      amount,
      paymentType: type,
      status: "pending",
      userId,
    });
    await payment.save();

    if (!booking.paymentType || booking.paymentStatus === "pending") {
      booking.paymentType = type;
      await booking.save();
    }

    res.json({ success: true, orderId, amount, paymentType: type });
  } catch (error) {
    res.status(500).json({ message: error.message || "Payment initiation failed" });
  }
};

exports.processPayment = async (req, res) => {
  try {
    const { orderId, bookingId, paymentDetails } = req.body;
    const userId = req.user._id || req.user.id;

    const { error } = await getBookingForTenant(bookingId, userId);
    if (error) return res.status(error.status).json({ message: error.message });

    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.status === "success") {
      return res.json({ success: true, message: "Payment already completed" });
    }

    const validation = validatePaymentInput(paymentDetails);
    if (!validation.valid) {
      payment.status = "failed";
      await payment.save();
      return res.json({ success: false, message: validation.message });
    }

    payment.status = "success";
    payment.transactionId = `TXN_${Date.now()}`;
    payment.paymentDetails = {
      method: paymentDetails.paymentMethod,
      processedAt: new Date(),
    };
    await payment.save();

    const booking = await Booking.findById(bookingId);
    if (booking) {
      updateBookingPayment(booking, payment.amount);
      await booking.save();
    }

    res.json({
      success: true,
      message: "Payment successful",
      amount: payment.amount,
      paymentType: payment.paymentType,
      paymentStatus: booking?.paymentStatus,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyPayment = async (req, res) => {
  try {
    const { orderId, bookingId } = req.body;
    const userId = req.user._id || req.user.id;

    const payment = await Payment.findOne({ orderId });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    if (payment.status === "success") {
      return res.json({ success: true, status: "success", payment });
    }

    res.json({ success: false, status: "failed", message: "Payment not completed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getPaymentHistory = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const payments = await Payment.find({ userId })
      .populate({
        path: "bookingId",
        populate: { path: "property", select: "title location" },
      })
      .sort({ createdAt: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingPayments = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const isTenant = booking.tenant.toString() === userId.toString();
    const isOwner = booking.owner.toString() === userId.toString();
    if (!isTenant && !isOwner) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const payments = await Payment.find({
      bookingId: booking._id,
      status: "success",
    }).sort({ createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
