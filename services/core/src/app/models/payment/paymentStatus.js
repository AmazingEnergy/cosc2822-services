const PaymentStatus = Object.freeze({
  New: "new",
  Completed: "successful",
  Cancelled: "cancelled",
});

module.exports = {
  name: Object.keys({ PaymentStatus })[0],
  ...PaymentStatus,
};
