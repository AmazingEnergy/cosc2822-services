const express = require("express");

const jwtCheck = require("../jwtCheck");

const cartsController = require("../app/controllers/cartsController");

const cartApiRoutes = express.Router();

cartApiRoutes.post("/carts", jwtCheck, cartsController.postCreateCart);
cartApiRoutes.get("/carts/:id", jwtCheck, cartsController.getCart);
cartApiRoutes.post(
  "/carts/:id/addItem",
  jwtCheck,
  cartsController.postAddCartItem
);
cartApiRoutes.post(
  "/carts/:id/removeItem",
  jwtCheck,
  cartsController.postRemoveCartItem
);
cartApiRoutes.post(
  "/carts/:id/updateItem",
  jwtCheck,
  cartsController.postUpdateCartItem
);
cartApiRoutes.post("/carts/:id/pay", jwtCheck, cartsController.postPayCart);
cartApiRoutes.post(
  "/carts/:id/submit",
  jwtCheck,
  cartsController.postSubmitCart
);

module.exports = cartApiRoutes;
