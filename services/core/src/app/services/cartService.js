const models = require("../models");
const BadRequestError = require("../errors/BadRequestError");
const NotFoundError = require("../errors/NotFoundError");
const ForbiddenError = require("../errors/ForbiddenError");

const stripeConnector = require("../../infra/connectors/stripeConnector");
const snsConnector = require("../../infra/connectors/snsConnector");

const cartRepository = require("../../infra/repositories/sequelizeCartRepository");
const orderRepository = require("../../infra/repositories/sequelizeOrderRepository");
const paymentRepository = require("../../infra/repositories/sequelizePaymentRepository");

const getCart = async (cartId, customerId) => {
  let cart = await cartRepository.findById(cartId);
  if (!cart) {
    throw new NotFoundError(`Not found cart with id ${cartId}`);
  }
  if (cart.customerId !== customerId) {
    throw new ForbiddenError(`Forbidden`);
  }
  return cart.dataValues;
};

const createCart = async (createCartDto) => {
  let cart = await cartRepository.addCart(
    new models.Cart(createCartDto.customerId, null, createCartDto.createdBy)
  );
  return cart.dataValues;
};

const addItem = async (addCartItemDto) => {
  let cart = await cartRepository.findById(addCartItemDto.cartId);
  if (!cart) {
    throw new NotFoundError(`Not found cart with id ${addCartItemDto.cartId}`);
  }
  if (cart.customerId !== addCartItemDto.customerId) {
    throw new ForbiddenError(`Forbidden`);
  }
  if (cart.submittedAt !== null) {
    throw new BadRequestError(`Cart has been submitted`);
  }

  const cartItem = cart.cartItems.find(
    (item) => item.skuId === addCartItemDto.skuId
  );
  if (cartItem) {
    cartItem.quantity += addCartItemDto.quantity;
    await cartRepository.saveCartItem(cartItem);
  } else {
    await cartRepository.addCartItem(
      new models.CartItem(
        cart.id,
        addCartItemDto.skuId,
        addCartItemDto.productName,
        addCartItemDto.productPrice,
        addCartItemDto.discountPrice,
        addCartItemDto.stockCode,
        addCartItemDto.quantity
      )
    );
  }
  return await getCart(addCartItemDto.cartId, addCartItemDto.customerId);
};

const updateItem = async (updateCartItemDto) => {
  let cart = await cartRepository.findById(updateCartItemDto.cartId);
  if (!cart) {
    throw new NotFoundError(
      `Not found cart with id ${updateCartItemDto.cartId}`
    );
  }
  if (cart.customerId !== updateCartItemDto.customerId) {
    throw new ForbiddenError(`Forbidden`);
  }
  if (cart.submittedAt !== null) {
    throw new BadRequestError(`Cart has been submitted`);
  }

  const cartItem = cart.cartItems.find(
    (item) => item.skuId === updateCartItemDto.skuId
  );
  if (cartItem) {
    if (updateCartItemDto.quantity == 0) {
      await cartRepository.deleteCartItem(cartItem.id);
    }
    cartItem.quantity = updateCartItemDto.quantity;
    cartItem.discountPrice = updateCartItemDto.discountPrice;
    await cartRepository.saveCartItem(cartItem);
  } else {
    throw new NotFoundError(
      `Not found cart item with skuId ${updateCartItemDto.skuId}`
    );
  }
  return await getCart(updateCartItemDto.cartId, updateCartItemDto.customerId);
};

const removeItem = async (removeCartItemDto) => {
  let cart = await cartRepository.findById(removeCartItemDto.cartId);
  if (!cart) {
    throw new NotFoundError(
      `Not found cart with id ${removeCartItemDto.cartId}`
    );
  }
  if (cart.customerId !== removeCartItemDto.customerId) {
    throw new ForbiddenError(`Forbidden`);
  }
  if (cart.submittedAt !== null) {
    throw new BadRequestError(`Cart has been submitted`);
  }

  const cartItem = cart.cartItems.find(
    (item) => item.skuId === removeCartItemDto.skuId
  );
  if (cartItem) {
    await cartRepository.deleteCartItem(cartItem.id);
  } else {
    throw new NotFoundError(
      `Not found cart item with skuId ${removeCartItemDto.skuId}`
    );
  }
  return await getCart(removeCartItemDto.cartId, removeCartItemDto.customerId);
};

const pay = async (payCartDto) => {
  let cart = await cartRepository.findById(payCartDto.cartId);
  if (!cart) {
    throw new NotFoundError(`Not found cart with id ${payCartDto.cartId}`);
  }
  if (cart.customerId !== payCartDto.customerId) {
    throw new ForbiddenError(`Forbidden`);
  }
  if (cart.submittedAt !== null) {
    throw new BadRequestError(`Cart has been submitted`);
  }
  if (
    cart.payments.some(
      (payment) => payment.status === models.PaymentStatus.Completed
    )
  ) {
    throw new BadRequestError(`Cart has been paid`);
  }

  const pendingPayments = cart.payments.filter(
    (payment) => payment.status === models.PaymentStatus.New
  );
  for (const payment of pendingPayments) {
    payment.status = models.PaymentStatus.Cancelled;
    payment.updatedBy = payCartDto.paidBy;
    await cartRepository.savePayment(payment);
  }

  const session = await stripeConnector.createSession(
    cart,
    payCartDto.returnUrl
  );
  console.log(`Generated Stripe checkout session: ${session.id}`);

  await paymentRepository.addPayment(
    new models.Payment(cart.id, session.id, payCartDto.paidBy)
  );

  return {
    clientSecret: session.client_secret,
  };
};

const submit = async (submitCartDto) => {
  let cart = await cartRepository.findById(submitCartDto.cartId);
  if (!cart) {
    throw new NotFoundError(`Not found cart with id ${submitCartDto.cartId}`);
  }
  if (cart.customerId !== submitCartDto.customerId) {
    throw new ForbiddenError(`Forbidden`);
  }
  if (cart.submittedAt !== null) {
    throw new BadRequestError(`Cart has been submitted`);
  }

  const order = await orderRepository.addOrder(
    new models.Order(
      cart.id,
      submitCartDto.customerId,
      submitCartDto.contactName,
      submitCartDto.contactEmail,
      submitCartDto.contactPhone,
      submitCartDto.deliveryAddress,
      submitCartDto.promotionCode,
      models.OrderStatus.New,
      submitCartDto.submittedBy
    )
  );

  for (const item of cart.cartItems) {
    await orderRepository.addOrderItem(
      new models.OrderItem(
        order.id,
        item.skuId,
        item.productName,
        item.stockCode,
        item.quantity,
        item.productPrice,
        item.discountPrice
      )
    );
  }

  cart.submittedAt = new Date();
  await cartRepository.saveCart(cart);

  const createdOrder = await orderRepository.findById(order.id);
  console.log(`Created order: ${createdOrder.id}`);
  await snsConnector.publicOrderEvent("OrderCreated", createdOrder.dataValues);

  return createdOrder.dataValues;
};

const paymentNotification = async (data, sig) => {
  // https://docs.stripe.com/payments/accept-a-payment?platform=web&ui=embedded-form#post-payment

  const event = stripeConnector.extractEvent(data, sig);

  switch (event.type) {
    case "checkout.session.completed":
    case "checkout.session.async_payment_succeeded":
      console.log(`Handle event type ${event.type} - ${event.id}`);
      const session = await stripeConnector.getSession(event.data.object.id);
      const cartId = session.metadata.cartId;
      const cart = await cartRepository.findById(cartId);
      if (!cart) {
        console.error(`Not found cart with id ${cartId}`);
        return;
      }
      const payment = cart.payments.find(
        (payment) => payment.paymentReference === session.id
      );
      if (payment) {
        payment.status = models.PaymentStatus.Completed;
        payment.updatedBy = "webhook";
        payment.updatedAt = new Date();
        await cartRepository.savePayment(payment);
      }
      await snsConnector.publicOrderEvent("CartPaySuccess", cart.dataValues);
      break;
    case "checkout.session.expired": {
      console.log(`Handle event type ${event.type} - ${event.id}`);
      const session = await stripeConnector.getSession(event.data.object.id);
      const cartId = session.metadata.cartId;
      const cart = await cartRepository.findById(cartId);
      if (!cart) {
        console.error(`Not found cart with id ${cartId}`);
        return;
      }
      const payment = cart.payments.find(
        (payment) => payment.paymentReference === session.id
      );
      if (payment) {
        payment.status = models.PaymentStatus.Cancelled;
        payment.updatedBy = "webhook";
        payment.updatedAt = new Date();
        await cartRepository.savePayment(payment);
      }
      await snsConnector.publicOrderEvent("CartPayFail", cart.dataValues);
      break;
    }
    default: {
      console.warn(`Unhandled event type ${event.type} - ${event.id}`);
    }
  }
};

module.exports = {
  getCart,
  createCart,
  addItem,
  updateItem,
  removeItem,
  pay,
  submit,
  paymentNotification,
};
