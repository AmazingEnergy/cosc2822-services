const controller = require("../../utils/controller");
const { extractUserClaims } = require("../../utils/claims");
const dto = require("../dto");

const getOrders = controller.get(async (req, res, next) => {
  // TODO: implement
}, dto.ListOrderQuery);

const getOrder = controller.get(async (req, res, next) => {
  // TODO: implement
}, dto.FindOrderParams);

const putCancelOrder = controller.put(
  async (req, res, next) => {
    // TODO: implement
  },
  dto.FindOrderParams,
  dto.CancelOrderDto
);

const putRejectOrder = controller.put(
  async (req, res, next) => {
    // TODO: implement
  },
  dto.FindOrderParams,
  dto.RejectOrderDto
);

const putCompleteOrder = controller.put(
  async (req, res, next) => {
    // TODO: implement
  },
  dto.FindOrderParams,
  dto.CompleteOrderDto
);

module.exports = {
  getOrders,
  getOrder,
  putCancelOrder,
  putRejectOrder,
  putCompleteOrder,
};
