const NotFoundError = require("../../app/errors/NotFoundError");
const BadRequestError = require("../../app/errors/BadRequestError");
const { sum } = require("../../utils/utils");

const cartRepository = require("../../infra/repositories/sequelizeCartRepository");
const orderRepository = require("../../infra/repositories/sequelizeOrderRepository");
const models = require("../models");

const listOrders = async (query) => {
  const orders = await Promise.all(
    (
      await orderRepository.listOrders(query)
    ).map(async (order) => {
      const cart = (await cartRepository.findById(order.cartId))?.dataValues;
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
        payments: cart?.payments || [],
      };
    })
  );
  return orders;
};

const findById = async (id) => {
  const order = await orderRepository.findById(id);
  if (!order) throw new NotFoundError(`Not found order with id ${id}`);
  const cart = (await cartRepository.findById(order.cartId))?.dataValues;
  const totalAmount = sum(
    order.orderItems.map((item) => item.productPrice * item.quantity)
  );
  const discountAmount = sum(
    order.orderItems.map((item) => (item.discountPrice || 0) * item.quantity)
  );
  return {
    ...order.dataValues,
    totalAmount: totalAmount,
    discountAmount: discountAmount,
    payments: cart?.payments || [],
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
      `Fail to complete. Invalid status of an Order ${completeOrderDto.orderId}.`
    );
  orderInDb.status = models.OrderStatus.Completed;
  orderInDb.updatedAt = new Date();
  orderInDb.updatedBy = completeOrderDto.completedBy;
  const savedOrder = await orderRepository.saveOrder(orderInDb);
  await snsConnector.publicOrderEvent("OrderCompleted", savedOrder.dataValues);
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
      `Fail to cancel. Invalid status of an Order ${cancelOrderDto.orderId}.`
    );

  let cart = await cartRepository.findById(submitCartDto.cartId);
  if (
    cart?.payments?.some(
      (payment) => payment.status === models.PaymentStatus.Completed
    )
  ) {
    throw new BadRequestError(
      `Fail to cancel. Order ${completeOrderDto.orderId} has been paid.`
    );
  }

  orderInDb.status = models.OrderStatus.Cancelled;
  orderInDb.updatedAt = new Date();
  orderInDb.updatedBy = cancelOrderDto.cancelledBy;
  const savedOrder = await orderRepository.saveOrder(orderInDb);
  await snsConnector.publicOrderEvent("OrderCancelled", savedOrder.dataValues);
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
      `Fail to reject. Invalid status of an Order ${rejectOrderDto.orderId}.`
    );
  // TODO: handle refund payment
  orderInDb.status = models.OrderStatus.Rejected;
  orderInDb.updatedAt = new Date();
  orderInDb.updatedBy = rejectOrderDto.rejectedBy;
  const savedOrder = await orderRepository.saveOrder(orderInDb);
  await snsConnector.publicOrderEvent("OrderRejected", savedOrder.dataValues);
  return savedOrder.dataValues;
};

module.exports = {
  listOrders,
  findById,
  completeOrder,
  cancelOrder,
  rejectOrder,
};
