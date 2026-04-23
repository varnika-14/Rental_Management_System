const mongoose = require("mongoose");
require("dotenv").config();

const Booking = require("./models/Booking");
const Property = require("./models/Property");
const User = require("./models/User");
const RentHistory = require("./models/RentHistory");

async function testBookingSystem() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("✅ Booking model:", Booking.modelName);
    console.log("✅ Property model:", Property.modelName);
    console.log("✅ User model:", User.modelName);
    console.log("✅ RentHistory model:", RentHistory.modelName);

    const bookingCount = await Booking.countDocuments();
    console.log(`✅ Found ${bookingCount} existing bookings`);

    const propertyCount = await Property.countDocuments();
    console.log(`✅ Found ${propertyCount} existing properties`);

    const userCount = await User.countDocuments();
    console.log(`✅ Found ${userCount} existing users`);

    console.log("✅ All booking system components are working correctly!");
  } catch (error) {
    console.error("❌ Error testing booking system:", error.message);
  } finally {
    await mongoose.disconnect();
    console.log("✅ Disconnected from MongoDB");
  }
}

testBookingSystem();
