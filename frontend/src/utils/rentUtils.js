export function getTotalRent(booking) {
  if (booking.totalRent) return booking.totalRent;
  const { monthlyRent, duration, durationType } = booking;
  if (durationType === "days") return Math.round((monthlyRent / 30) * duration);
  if (durationType === "years") return monthlyRent * 12 * duration;
  return monthlyRent * duration;
}

export function getRemainingRent(booking) {
  return Math.max(0, getTotalRent(booking) - (booking.paidAmount || 0));
}

export function getPaymentAmount(booking, paymentType) {
  if (paymentType === "monthly") {
    const remaining = getRemainingRent(booking);
    return Math.min(booking.monthlyRent, remaining);
  }
  return getRemainingRent(booking);
}

export function getPaymentStatusLabel(status) {
  const labels = {
    pending: "Pending",
    partial: "Partially Paid",
    paid: "Paid",
    failed: "Failed",
  };
  return labels[status] || status;
}

export function getPaymentStatusClass(status) {
  if (status === "paid") return "paid";
  if (status === "partial") return "partial";
  return "pending";
}
