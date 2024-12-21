const express = require("express");

const jwtCheck = require("../jwtCheck");

const profileController = require("../app/controllers/profileController");

const profileApiRoutes = express.Router();

profileApiRoutes.get("/profile", jwtCheck, profileController.getProfile);
profileApiRoutes.post(
  "/profile",
  jwtCheck,
  profileController.postUpdateProfile
);

module.exports = profileApiRoutes;
