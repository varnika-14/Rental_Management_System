const Booking = require("../models/Booking");
const Property = require("../models/Property");

// CREATE BOOKING
// CREATE BOOKING
exports.createBookingRequest = async (req, res) => {
  try {
    const { propertyId, startDate, duration, durationType } = req.body;
    const tenantId = req.user._id || req.user.id;
    const requestedStartDate = new Date(startDate);

    // 1. Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 2. PREVENT OVERLAPPING BOOKINGS
    // If the property is booked, check if the requested start date is before the current booking ends
    if (property.isBooked && property.bookingEndDate) {
      const availableDate = new Date(property.bookingEndDate);

      if (requestedStartDate < availableDate) {
        return res.status(400).json({
          message: `This property is occupied until ${availableDate.toLocaleDateString()}. Please select a start date after this period.`,
        });
      }
    }

    // 3. PREVENT DUPLICATE REQUESTS
    // Check if this tenant already has a pending request for this specific property
    const existingRequest = await Booking.findOne({
      property: propertyId,
      tenant: tenantId,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "You already have a pending request for this property.",
      });
    }

    // 4. Calculate Total Rent
    const rentAmount = property.rent;
    const totalRent =
      durationType === "months"
        ? rentAmount * duration
        : rentAmount * 12 * duration;

    // 5. Create the booking
    const booking = new Booking({
      property: propertyId,
      tenant: tenantId,
      owner: property.owner,
      startDate: requestedStartDate,
      duration: parseInt(duration),
      durationType,
      monthlyRent: rentAmount,
      totalRent: totalRent,
    });

    await booking.save();

    res.status(201).json({
      message: "Booking request sent successfully!",
      booking,
    });
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
// backend/controllers/bookingController.js

exports.acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    // 1. Calculate End Date based on duration and type
    let endDate = new Date(booking.startDate);
    if (booking.durationType === "months") {
      endDate.setMonth(endDate.getMonth() + booking.duration);
    } else {
      endDate.setFullYear(endDate.getFullYear() + booking.duration);
    }

    // 2. Update Booking Status
    booking.status = "accepted";
    await booking.save();

    // 3. Update Property Status and End Date
    await Property.findByIdAndUpdate(booking.property, {
      isBooked: true,
      bookingEndDate: endDate,
    });

    // 4. AUTOMATIC REJECTION: Reject all other PENDING requests for this same property
    await Booking.updateMany(
      {
        property: booking.property,
        _id: { $ne: booking._id },
        status: "pending",
      },
      {
        status: "rejected",
        rejectionReason: "Property booked by another tenant.",
      },
    );

    res.json({ message: "Booking accepted and property updated", endDate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// CANCEL BOOKING (For Tenant)
exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const booking = await Booking.findById(id);
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
    const { id } = req.params;
    // Handle cases where rejectionReason might not be sent in the body
    const rejectionReason = req.body?.rejectionReason || "Declined by owner";
    const ownerId = (req.user._id || req.user.id).toString();

    const booking = await Booking.findById(id);
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
