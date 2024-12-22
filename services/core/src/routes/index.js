const { API_PATH } = require("../utils/constants");

const basicRoutes = require("./basicRoute");
const profileApiRoutes = require("./profileApiRoute");
const cartApiRoutes = require("./cartApiRoute");
const orderApiRoutes = require("./orderApiRoute");
const hookApiRoutes = require("./hookApiRoute");

function route(app) {
  app.use("/", basicRoutes);
  app.use(API_PATH, profileApiRoutes);
  app.use(API_PATH, cartApiRoutes);
  app.use(API_PATH, orderApiRoutes);
  app.use(API_PATH, hookApiRoutes);
}

module.exports = route;
