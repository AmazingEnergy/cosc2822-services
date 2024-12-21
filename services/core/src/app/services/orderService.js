const NotFoundError = require("../../app/errors/NotFoundError");
const BadRequestError = require("../../app/errors/BadRequestError");
const { sum } = require("../../utils/utils");

const orderRepository = require("../../infra/repositories/sequelizeOrderRepository");
const models = require("../models");

const listOrders = async (query) => {
  const orders = await Promise.all(
    (
      await orderRepository.listOrders(query)
    ).map(async (order) => {
      const totalAmount = sum(
        order.orderItems.map((item) => item.productPrice * item.quantity)
      );
      const discountAmount = sum(
        order.orderItems.map(
          (item) => (item.discountPrice || 0) * item.quantity
        )
      );
      return {
        ...order.dataValues,
        totalAmount: totalAmount,
        discountAmount: discountAmount,
      };
    })
  );
  return orders;
};

const findById = async (id) => {
  const order = await orderRepository.findById(id);
  const totalAmount = sum(
    orderItems.map((item) => item.productPrice * item.quantity)
  );
  const discountAmount = sum(
    orderItems.map((item) => (item.discountPrice || 0) * item.quantity)
  );
  return {
    ...order.dataValues,
    totalAmount: totalAmount,
    discountAmount: discountAmount,
  };
};

const completeOrder = async (completeOrderDto) => {
  const orderInDb = await orderRepository.findById(completeOrderDto.orderId);
  if (!orderInDb)
    throw new NotFoundError(
      `Not found order with id ${completeOrderDto.orderId}`
    );
  if (orderInDb.status !== models.OrderStatus.New)
    throw new BadRequestError(
      `Order ${completeOrderDto.orderId} is not allowed to complete.`
    );
  orderInDb.status = models.OrderStatus.Completed;
  orderInDb.updatedAt = new Date();
  orderInDb.updatedBy = completeOrderDto.completedBy;
  const savedOrder = await orderRepository.saveOrder(orderInDb);
  return savedOrder.dataValues;
};

const cancelOrder = async (cancelOrderDto) => {
  const orderInDb = await orderRepository.findById(cancelOrderDto.orderId);
  if (!orderInDb)
    throw new NotFoundError(
      `Not found order with id ${cancelOrderDto.orderId}`
    );
  if (orderInDb.status !== models.OrderStatus.New)
    throw new BadRequestError(
      `Order ${cancelOrderDto.orderId} is not allowed to cancel.`
    );
  orderInDb.status = models.OrderStatus.Cancelled;
  orderInDb.updatedAt = new Date();
  orderInDb.updatedBy = cancelOrderDto.cancelledBy;
  const savedOrder = await orderRepository.saveOrder(orderInDb);
  return savedOrder.dataValues;
};

const rejectOrder = async (rejectOrderDto) => {
  const orderInDb = await orderRepository.findById(rejectOrderDto.orderId);
  if (!orderInDb)
    throw new NotFoundError(
      `Not found order with id ${rejectOrderDto.orderId}`
    );
  if (orderInDb.status !== models.OrderStatus.New)
    throw new BadRequestError(
      `Order ${rejectOrderDto.orderId} is not allowed to reject.`
    );
  orderInDb.status = models.OrderStatus.Rejected;
  orderInDb.updatedAt = new Date();
  orderInDb.updatedBy = rejectOrderDto.rejectedBy;
  const savedOrder = await orderRepository.saveOrder(orderInDb);
  return savedOrder.dataValues;
};

module.exports = {
  listOrders,
  findById,
  completeOrder,
  cancelOrder,
  rejectOrder,
};
