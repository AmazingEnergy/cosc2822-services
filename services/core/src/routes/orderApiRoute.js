const express = require("express");

const jwtCheck = require("../jwtCheck");

const ordersController = require("../app/controllers/ordersController");

const orderApiRoutes = express.Router();

orderApiRoutes.get("/orders", jwtCheck, ordersController.getOrders);
orderApiRoutes.get("/orders/:id", jwtCheck, ordersController.getOrder);
orderApiRoutes.put(
  "/orders/:id/cancel",
  jwtCheck,
  ordersController.putCancelOrder
);
orderApiRoutes.put(
  "/orders/:id/complete",
  jwtCheck,
  ordersController.putCompleteOrder
);
orderApiRoutes.put(
  "/orders/:id/reject",
  jwtCheck,
  ordersController.putRejectOrder
);

module.exports = orderApiRoutes;
