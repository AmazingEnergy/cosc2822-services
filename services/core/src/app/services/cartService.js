const models = require("../models");
const productService = require("./productService");
const cartRepository = require("../../infra/repositories/sequelizeCartRepository");

const getCart = async (customerId) => {
  let cart = await cartRepository.loadCart(customerId);
  if (!cart) {
    cart = await cartRepository.addCart(new models.Cart(customerId));
    cart.cartItems = [];
  }
  for (const item of cart.cartItems) {
    const product = await productService.findById(item.productId);
    item["productTitle"] = product.title;
    item["productPrice"] = product.price;
    item["productDiscountPrice"] = product.discountPrice;
    item["productImageUrl"] = product.imageUrl;
  }
  return cart;
};

const clearCart = async (customerId) => {
  const cart = await cartRepository.loadCart(customerId);
  await cartRepository.deleteCartItems(cart.id);
};

const addItems = async (customerId, productId, quantity) => {
  const cart = await cartRepository.loadCart(customerId);
  if (!cart) {
    await cartRepository.addCart(new models.Cart(customerId));
  }

  const cartItem = cart.cartItems.find((item) => item.productId === productId);
  if (cartItem) {
    cartItem.quantity += quantity;
    await cartRepository.saveCartItem(cartItem);
  } else {
    await cartRepository.addCartItem(
      new models.CartItem(cart.id, productId, quantity)
    );
  }
};

const removeItems = async (customerId, productId, quantity) => {
  const cart = await cartRepository.loadCart(customerId);
  if (!cart) {
    return;
  }
  const cartItem = cart.cartItems.find((item) => item.productId === productId);
  if (!cartItem) {
    return;
  }
  if (cartItem.quantity <= quantity) {
    await cartRepository.deleteCartItem(cartItem.id);
  } else {
    cartItem.quantity -= quantity;
    await cartRepository.saveCartItem(cartItem);
  }
};

module.exports = {
  getCart,
  clearCart,
  addItems,
  removeItems,
};
