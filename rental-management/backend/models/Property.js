const mongoose = require("mongoose");

const PropertySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    type: { type: String, required: true },
    rent: { type: Number, required: true },
    location: { type: String, required: true },
    address: { type: String },
    images: [{ type: String }],
  },
  { timestamps: true },
);

module.exports = mongoose.model("Property", PropertySchema);
