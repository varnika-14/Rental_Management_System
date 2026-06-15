function getTotalRent(booking) {
  if (booking.totalRent) return booking.totalRent;
  const { monthlyRent, duration, durationType } = booking;
  if (durationType === "days") return Math.round((monthlyRent / 30) * duration);
  if (durationType === "years") return monthlyRent * 12 * duration;
  return monthlyRent * duration;
}

function getRemainingRent(booking) {
  return Math.max(0, getTotalRent(booking) - (booking.paidAmount || 0));
}

function getPaymentAmount(booking, paymentType) {
  if (paymentType === "monthly") {
    const remaining = getRemainingRent(booking);
    return Math.min(booking.monthlyRent, remaining);
  }
  return getRemainingRent(booking);
}

function updateBookingPayment(booking, amount) {
  booking.paidAmount = (booking.paidAmount || 0) + amount;
  const total = getTotalRent(booking);
  if (booking.paidAmount >= total) {
    booking.paymentStatus = "paid";
    booking.paidAmount = total;
  } else if (booking.paidAmount > 0) {
    booking.paymentStatus = "partial";
  }
}

module.exports = {
  getTotalRent,
  getRemainingRent,
  getPaymentAmount,
  updateBookingPayment,
};
