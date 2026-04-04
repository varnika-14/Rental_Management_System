const mongoose = require("mongoose");

const RentHistorySchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
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
    monthlyRent: {
      type: Number,
      required: true,
    },
    totalRent: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    durationType: {
      type: String,
      enum: ["months", "years"],
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "completed", "terminated"],
      default: "active",
    },
    payments: [{
      date: {
        type: Date,
        required: true,
      },
      amount: {
        type: Number,
        required: true,
      },
      status: {
        type: String,
        enum: ["paid", "pending", "overdue"],
        default: "pending",
      },
      paymentMethod: {
        type: String,
      },
      transactionId: {
        type: String,
      },
    }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("RentHistory", RentHistorySchema);
