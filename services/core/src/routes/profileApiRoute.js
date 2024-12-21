const express = require("express");

const profileController = require("../app/controllers/profileController");

const profileApiRoutes = express.Router();

profileApiRoutes.get("/profile", profileController.getProfile);
profileApiRoutes.post("/profile", profileController.postUpdateProfile);

module.exports = profileApiRoutes;
