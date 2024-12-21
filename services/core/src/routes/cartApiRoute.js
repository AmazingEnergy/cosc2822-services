const express = require("express");

const cartsController = require("../app/controllers/cartsController");

const cartApiRoutes = express.Router();

cartApiRoutes.post("/carts", cartsController.postCreateCart);
cartApiRoutes.get("/carts/:id", cartsController.getCart);
cartApiRoutes.post("/carts/:id/addItem", cartsController.postAddCartItem);
cartApiRoutes.post("/carts/:id/removeItem", cartsController.postRemoveCartItem);
cartApiRoutes.post("/carts/:id/updateItem", cartsController.postUpdateCartItem);
cartApiRoutes.post("/carts/:id/pay", cartsController.postPayCart);
cartApiRoutes.post("/carts/:id/submit", cartsController.postSubmitCart);

module.exports = cartApiRoutes;
