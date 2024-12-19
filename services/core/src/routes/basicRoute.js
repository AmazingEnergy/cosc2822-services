const express = require("express");

const basicRoutes = express.Router();

basicRoutes.get("/", (req, res, next) => {
  res.json({ message: "Hello World" });
});

module.exports = basicRoutes;
