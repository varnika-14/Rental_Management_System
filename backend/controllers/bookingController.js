const Booking = require("../models/Booking");
const Property = require("../models/Property");

// CREATE BOOKING
// CREATE BOOKING
exports.createBookingRequest = async (req, res) => {
  try {
    const { propertyId, startDate, duration, durationType } = req.body;

    // 1. Check if user is logged in (from auth middleware)
    if (!req.user || (!req.user._id && !req.user.id)) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // 2. Normalize the ID (handle both id and _id)
    const tenantId = req.user._id || req.user.id;

    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    // 3. Create the booking with the tenantId
    const booking = new Booking({
      property: propertyId,
      tenant: tenantId, // Using the normalized ID
      owner: property.owner,
      startDate: new Date(startDate),
      duration: parseInt(duration),
      durationType,
      monthlyRent: property.rent,
      totalRent:
        durationType === "months"
          ? property.rent * duration
          : property.rent * 12 * duration,
    });

    await booking.save();
    await booking.populate(["property", "tenant", "owner"]);

    res
      .status(201)
      .json({ message: "Booking request sent successfully", booking });
  } catch (err) {
    console.log("BOOKING ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};
// OWNER REQUESTS
// exports.getOwnerBookingRequests
exports.getOwnerBookingRequests = async (req, res) => {
  try {
    // Ensure we match the ID from the auth middleware
    const ownerId = req.user._id || req.user.id;

    const bookings = await Booking.find({ owner: ownerId })
      .populate("property") // Get property details
      .populate("tenant", "name email") // Get only name and email of tenant
      .sort({ createdAt: -1 }); // Newest first

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// exports.getTenantBookings
exports.getTenantBookings = async (req, res) => {
  try {
    const tenantId = req.user._id || req.user.id;

    const bookings = await Booking.find({ tenant: tenantId })
      .populate("property")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ACCEPT
// ACCEPT BOOKING
exports.acceptBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const ownerId = req.user._id || req.user.id; // Support both JWT formats

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // FIX: Professional ID comparison
    if (booking.owner.toString() !== ownerId.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized: Owner ID mismatch" });
    }

    if (booking.status !== "pending") {
      return res.status(400).json({ message: "Booking is no longer pending" });
    }

    booking.status = "accepted";
    await booking.save();

    // Update Property status
    await Property.findByIdAndUpdate(booking.property, {
      isBooked: true,
      bookedBy: booking.tenant,
    });

    res.json({ message: "Booking accepted", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CANCEL BOOKING (For Tenant)
exports.cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // Check if requester is the tenant OR the owner
    const isTenant = booking.tenant.toString() === userId;
    const isOwner = booking.owner.toString() === userId;

    if (!isTenant && !isOwner) {
      return res.status(403).json({ message: "Not authorized to cancel" });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// REJECT BOOKING
exports.rejectBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    // Handle cases where rejectionReason might not be sent in the body
    const rejectionReason = req.body?.rejectionReason || "Declined by owner";
    const ownerId = (req.user._id || req.user.id).toString();

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // Authorization Check
    if (booking.owner.toString() !== ownerId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Update Status
    booking.status = "rejected";
    booking.rejectionReason = rejectionReason;

    await booking.save();

    // Populate carefully (ensure these models exist)
    await booking.populate([
      { path: "property", select: "title" },
      { path: "tenant", select: "name email" },
    ]);

    res.json({ message: "Booking rejected successfully", booking });
  } catch (error) {
    console.error("REJECT FUNCTION ERROR:", error);
    res
      .status(500)
      .json({ message: "Server error during rejection: " + error.message });
  }
};
