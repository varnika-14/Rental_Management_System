const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["admin", "owner", "tenant"],
      default: "tenant",
    },
    profilePhoto: { type: String, required: true }, // Stores the path/URL
    age: { type: Number, required: true },
    qualification: { type: String, required: true },
    occupation: { type: String, required: true },
    salary: { type: Number, required: true },
    phonenumber: { type: String, required: true },
    permanentAddress: { type: String, required: true }, // <--- New Field
    emergencyContact: { type: String, required: true }, // <--- New Field
    govtIdNumber: { type: String, required: true },
    govtIdPhoto: { type: String, required: true }, // Stores the path/URL
    upiId: { type: String, required: true },
    bankDetails: { type: String, required: true },
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
