const controller = require("../../utils/controller");
const { extractUserClaims } = require("../../utils/claims");
const dto = require("../dto");
const orderService = require("../services/orderService");

const getOrders = controller.get(async (req, res, next) => {
  const claims = extractUserClaims(req);
  const query = { ...req.query, customerId: claims.userId };
  if (claims.role === "admin") {
    delete query.customerId;
  }
  res.json(await orderService.listOrders(query));
}, dto.ListOrderQuery);

const getOrder = controller.get(async (req, res, next) => {
  res.json(await orderService.findById(req.params.id));
}, dto.FindOrderParams);

const putCancelOrder = controller.put(
  async (req, res, next) => {
    res.json(
      await orderService.cancelOrder({
        ...req.body,
        orderId: req.params.id,
        cancelledBy: extractUserClaims(req).email,
      })
    );
  },
  dto.FindOrderParams,
  dto.CancelOrderDto
);

const putRejectOrder = controller.put(
  async (req, res, next) => {
    res.json(
      await orderService.rejectOrder({
        ...req.body,
        orderId: req.params.id,
        rejectedBy: extractUserClaims(req).email,
      })
    );
  },
  dto.FindOrderParams,
  dto.RejectOrderDto
);

const putCompleteOrder = controller.put(
  async (req, res, next) => {
    res.json(
      await orderService.completeOrder({
        ...req.body,
        orderId: req.params.id,
        completedBy: extractUserClaims(req).email,
      })
    );
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
