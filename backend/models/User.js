const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    // --- Basic Auth Info ---
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "owner", "tenant"],
      default: "tenant",
    },

    // --- Mandatory Personal Details ---
    profilePhoto: { type: String, required: true }, // Stores the path/URL
    age: { type: Number, required: true },
    qualification: { type: String, required: true },
    occupation: { type: String, required: true },
    salary: { type: Number, required: true },
    phonenumber: { type: String, required: true },
    permanentAddress: { type: String, required: true }, // <--- New Field
    emergencyContact: { type: String, required: true }, // <--- New Field

    // --- Identity Verification ---
    govtIdNumber: { type: String, required: true },
    govtIdPhoto: { type: String, required: true }, // Stores the path/URL

    // --- Financial Details ---
    upiId: { type: String, required: true },
    bankDetails: { type: String, required: true },

    // --- Tracking ---
    lastLogin: {
      type: Date,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
