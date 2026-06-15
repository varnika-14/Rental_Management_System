const Booking = require("../models/Booking");
const Property = require("../models/Property");
const Payment = require("../models/Payment");
const { getTotalRent } = require("../utils/rentUtils");

exports.createBookingRequest = async (req, res) => {
  try {
    const { propertyId, startDate, duration, durationType } = req.body;
    const tenantId = req.user._id || req.user.id;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    const start = new Date(startDate);
    const end = new Date(startDate);
    const dur = parseInt(duration);

    if (durationType === "days") {
      end.setDate(end.getDate() + dur);
    } else if (durationType === "months") {
      end.setMonth(end.getMonth() + dur);
    } else if (durationType === "years") {
      end.setFullYear(end.getFullYear() + dur);
    }

    const overlappingBooking = await Booking.findOne({
      property: propertyId,
      status: "accepted",
      $or: [
        {
          startDate: { $lt: end },
          endDate: { $gt: start },
        },
      ],
    });

    if (overlappingBooking) {
      return res.status(400).json({
        message: `This property is already reserved from ${new Date(
          overlappingBooking.startDate,
        ).toLocaleDateString()} to ${new Date(
          overlappingBooking.endDate,
        ).toLocaleDateString()}.`,
      });
    }

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

    const rentAmount = property.rent;
    let totalRent = 0;
    if (durationType === "days") {
      totalRent = (rentAmount / 30) * dur;
    } else if (durationType === "months") {
      totalRent = rentAmount * dur;
    } else {
      totalRent = rentAmount * 12 * dur;
    }

    const booking = new Booking({
      property: propertyId,
      tenant: tenantId,
      owner: property.owner,
      startDate: start,
      endDate: end,
      duration: dur,
      durationType,
      monthlyRent: rentAmount,
      totalRent: Math.round(totalRent),
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

exports.acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await Booking.findById(id);

    if (!booking) return res.status(404).json({ message: "Booking not found" });

    const startDate = new Date(booking.startDate);
    let endDate = new Date(booking.startDate);
    const duration = parseInt(booking.duration);

    if (booking.durationType === "days") {
      endDate.setDate(endDate.getDate() + duration);
    } else if (booking.durationType === "months") {
      endDate.setMonth(endDate.getMonth() + duration);
    } else if (booking.durationType === "years") {
      endDate.setFullYear(endDate.getFullYear() + duration);
    }

    booking.status = "accepted";
    booking.endDate = endDate;
    await booking.save();

    await Property.findByIdAndUpdate(booking.property, {
      isBooked: true,
      bookingEndDate: endDate,
    });

    await Booking.updateMany(
      {
        property: booking.property,
        _id: { $ne: booking._id },
        status: "pending",
        $or: [
          {
            startDate: { $lt: endDate },
            endDate: { $gt: startDate },
          },
        ],
      },
      {
        status: "rejected",
        rejectionReason: "Property reserved for overlapping dates.",
      },
    );

    res.json({ message: "Booking accepted", endDate });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAcceptedBookingsByProperty = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const bookings = await Booking.find({
      property: propertyId,
      status: "accepted",
    }).select("startDate endDate");

    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = (req.user._id || req.user.id).toString();

    const booking = await Booking.findById(id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (
      booking.tenant.toString() !== userId &&
      booking.owner.toString() !== userId
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (booking.status === "accepted") {
      await Property.findByIdAndUpdate(booking.property, {
        isBooked: false,
        bookingEndDate: null,
      });
    }

    booking.status = "cancelled";
    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const rejectionReason = req.body?.rejectionReason || "Declined by owner";
    const ownerId = (req.user._id || req.user.id).toString();

    const booking = await Booking.findById(id);
    if (!booking || booking.owner.toString() !== ownerId) {
      return res.status(403).json({ message: "Unauthorized or not found" });
    }

    booking.status = "rejected";
    booking.rejectionReason = rejectionReason;
    await booking.save();

    res.json({ message: "Booking rejected successfully", booking });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getOwnerBookingRequests = async (req, res) => {
  try {
    const ownerId = req.user._id || req.user.id;
    const bookings = await Booking.find({ owner: ownerId })
      .populate("property")
      .populate("tenant", "name email phonenumber")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getTenantBookings = async (req, res) => {
  try {
    const tenantId = req.user._id || req.user.id;
    const bookings = await Booking.find({ tenant: tenantId })
      .populate("property")
      .populate("owner", "name email phonenumber")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getRentTracking = async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const role = req.user.role;
    const filter =
      role === "owner"
        ? { owner: userId, status: "accepted" }
        : { tenant: userId, status: "accepted" };

    const bookings = await Booking.find(filter)
      .populate("property")
      .populate(role === "owner" ? "tenant" : "owner", "name email phonenumber")
      .sort({ createdAt: -1 });

    const bookingIds = bookings.map((b) => b._id);
    const payments = await Payment.find({
      bookingId: { $in: bookingIds },
      status: "success",
    }).sort({ createdAt: -1 });

    const paymentsByBooking = {};
    payments.forEach((p) => {
      const key = p.bookingId.toString();
      if (!paymentsByBooking[key]) paymentsByBooking[key] = [];
      paymentsByBooking[key].push(p);
    });

    const data = bookings.map((b) => {
      const totalRent = getTotalRent(b);
      const paidAmount = b.paidAmount || 0;
      return {
        ...b.toObject(),
        totalRent,
        remaining: Math.max(0, totalRent - paidAmount),
        payments: paymentsByBooking[b._id.toString()] || [],
      };
    });

    const summary = {
      totalRevenue: data.reduce((sum, b) => sum + (b.paidAmount || 0), 0),
      pendingAmount: data.reduce((sum, b) => sum + b.remaining, 0),
      fullyPaidCount: data.filter((b) => b.paymentStatus === "paid").length,
      activeRentals: data.length,
    };

    res.json({ bookings: data, summary });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
