const { API_PATH } = require("../utils/constants");

const basicRoutes = require("./basicRoute");

function route(app) {
  app.use("/", basicRoutes);
  // app.use(API_PATH, cartApiRoutes);
  // app.use(API_PATH, orderApiRoutes);
}

module.exports = route;
