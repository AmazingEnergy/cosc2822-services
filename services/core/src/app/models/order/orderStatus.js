const OrderStatus = Object.freeze({
  New: "new",
  Completed: "completed",
  Cancelled: "cancelled",
  Rejected: "rejected",
});

module.exports = {
  name: Object.keys({ OrderStatus })[0],
  ...OrderStatus,
};
