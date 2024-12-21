const OrderStatus = Object.freeze({
  New: "new",
  Completed: "completed",
  Cancelled: "cancelled",
});

module.exports = {
  name: Object.keys({ OrderStatus })[0],
  ...OrderStatus,
};
