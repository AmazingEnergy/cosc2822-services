const express = require("express");

const ordersController = require("../app/controllers/ordersController");

const orderApiRoutes = express.Router();

orderApiRoutes.get("/orders", ordersController.getOrders);
orderApiRoutes.get("/orders/:id", ordersController.getOrder);
orderApiRoutes.put("/orders/:id/cancel", ordersController.putCancelOrder);
orderApiRoutes.put("/orders/:id/complete", ordersController.putCompleteOrder);
orderApiRoutes.put("/orders/:id/reject", ordersController.putRejectOrder);

module.exports = orderApiRoutes;
