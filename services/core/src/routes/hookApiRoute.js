const express = require("express");
const bodyParser = require("body-parser");

const hooksController = require("../app/controllers/hooksController");

const hookApiRoutes = express.Router();

hookApiRoutes.post(
  "/hooks/stripe/payments",
  bodyParser.raw({ type: "*/*" }),
  hooksController.postStripeNotifications
);

module.exports = hookApiRoutes;
