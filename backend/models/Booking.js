const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    tenant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    durationType: {
      type: String,
      enum: ["days", "months", "years"],
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "cancelled"],
      default: "pending",
    },
    monthlyRent: {
      type: Number,
      required: true,
    },
    totalRent: {
      type: Number,
    },
    paymentType: {
      type: String,
      enum: ["one_time", "monthly"],
      default: "one_time",
    },
    rejectionReason: String,
    cancellationReason: String,
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "partial", "failed"],
      default: "pending",
    },
    paidAmount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", BookingSchema);
