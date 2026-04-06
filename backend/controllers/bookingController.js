const Booking = require("../models/Booking");
const Property = require("../models/Property");

// CREATE BOOKING
// CREATE BOOKING
exports.createBookingRequest = async (req, res) => {
  try {
    const { propertyId, startDate, duration, durationType } = req.body;
    const tenantId = req.user._id || req.user.id;

    // 1. Check if property exists
    const property = await Property.findById(propertyId);
    if (!property)
      return res.status(404).json({ message: "Property not found" });

    // 2. PREVENT DOUBLE BOOKING: Check if property is already occupied
    if (property.isBooked) {
      return res
        .status(400)
        .json({
          message: "This property is already booked by another tenant.",
        });
    }

    // 3. PREVENT DUPLICATE REQUESTS: Check if THIS tenant already has a pending request for THIS property
    const existingRequest = await Booking.findOne({
      property: propertyId,
      tenant: tenantId,
      status: "pending",
    });

    if (existingRequest) {
      return res
        .status(400)
        .json({
          message: "You already have a pending request for this property.",
        });
    }

    // 4. Create the booking
    const booking = new Booking({
      property: propertyId,
      tenant: tenantId,
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
    res
      .status(201)
      .json({ message: "Booking request sent successfully", booking });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
// OWNER REQUESTS
// exports.getOwnerBookingRequests
// GET OWNER REQUESTS (For the Owner's Dashboard)
exports.getOwnerBookingRequests = async (req, res) => {
  try {
    const ownerId = req.user._id || req.user.id;

    const bookings = await Booking.find({ owner: ownerId })
      .populate("property") // Gets all property details (title, location, images, rent)
      .populate("tenant", "name email phoneNumber") // Gets specific tenant details
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET TENANT BOOKINGS (For the Tenant's Dashboard)
exports.getTenantBookings = async (req, res) => {
  try {
    const tenantId = req.user._id || req.user.id;

    const bookings = await Booking.find({ tenant: tenantId })
      .populate("property") // Gets full property details
      .populate("owner", "name email phoneNumber") // Gets specific owner details
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
