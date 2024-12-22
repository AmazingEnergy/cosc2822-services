const controller = require("../../utils/controller");
const { extractUserClaims } = require("../../utils/claims");
const dto = require("../dto");
const orderService = require("../services/orderService");
const ForbiddenError = require("../errors/ForbiddenError");

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
    const claims = extractUserClaims(req);
    if (claims.role === "admin") {
      throw new ForbiddenError("Only customer can cancel order.");
    }
    res.json(
      await orderService.cancelOrder({
        ...req.body,
        orderId: req.params.id,
        cancelledBy: claims.email,
      })
    );
  },
  dto.FindOrderParams,
  dto.CancelOrderDto
);

const putRejectOrder = controller.put(
  async (req, res, next) => {
    const claims = extractUserClaims(req);
    if (claims.role !== "admin") {
      throw new ForbiddenError("Only admin can reject order.");
    }
    res.json(
      await orderService.rejectOrder({
        ...req.body,
        orderId: req.params.id,
        rejectedBy: claims.email,
      })
    );
  },
  dto.FindOrderParams,
  dto.RejectOrderDto
);

const putCompleteOrder = controller.put(
  async (req, res, next) => {
    const claims = extractUserClaims(req);
    if (claims.role !== "admin") {
      throw new ForbiddenError("Only admin can complete order.");
    }
    res.json(
      await orderService.completeOrder({
        ...req.body,
        orderId: req.params.id,
        completedBy: claims.email,
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
