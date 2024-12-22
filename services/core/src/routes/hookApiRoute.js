const express = require("express");

const hooksController = require("../app/controllers/hooksController");

const hookApiRoutes = express.Router();

hookApiRoutes.post(
  "/hooks/stripe/payments",
  hooksController.postStripeNotifications
);

module.exports = hookApiRoutes;
