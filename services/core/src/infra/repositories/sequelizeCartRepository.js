const models = require("../../app/models");
const dbContext = require("../entities");

/**
 * @param id
 * @returns
 * @type {(id: uuid) => Promise<import("sequelize").Model<any, any>>}
 */
const findById = async (id) => {
  return dbContext.carts.findByPk(id, {
    include: [
      {
        model: dbContext.cartItems,
        as: "cartItems",
        attributes: models.CartItem.getAttributes(),
      },
      {
        model: dbContext.payments,
        as: "payments",
        attributes: models.Payment.getAttributes(),
      },
    ],
    attributes: models.Cart.getAttributes(),
  });
};

/**
 * @param cart
 * @returns
 * @type {(cart: import("../../app/models").Cart) => Promise<import("sequelize").Model<any, any>>}
 */
const addCart = async (cart) => {
  return await dbContext.carts.create(cart, { returning: true });
};

/**
 * @param cart
 * @returns
 * @type {(cart: import("sequelize").Model<any, any>) => Promise<import("sequelize").Model<any, any>>}
 */
const saveCart = async (cart) => {
  return await cart.save();
};

/**
 * @param cartItem
 * @returns
 * @type {(cartItems: import("../../app/models").CartItem) => Promise<import("sequelize").Model<any, any>>}
 */
const addCartItem = async (cartItem) => {
  return await dbContext.cartItems.create(cartItem);
};

/**
 * @param cartItems
 * @returns
 * @type {(cartItems: import("../../app/models").CartItem[]) => Promise<import("sequelize").Model<any, any>>[]}
 */
const addCartItems = async (cartItems) => {
  return await dbContext.cartItems.bulkCreate(cartItems, {
    updateOnDuplicate: ["productId", "quantity"],
    returning: true,
  });
};

/**
 * @param cartItem
 * @returns
 * @type {(cartItem: import("sequelize").Model<any, any>) => Promise<import("sequelize").Model<any, any>>}
 */
const saveCartItem = async (cartItem) => {
  return await cartItem.save();
};

/**
 * @param cartItemId
 * @returns
 * @type {(cartItemId: uuid) => Promise<number>}
 */
const deleteCartItem = async (cartItemId) => {
  return await dbContext.cartItems.destroy({
    where: {
      id: cartItemId,
    },
  });
};

/**
 * @param cartId
 * @returns
 * @type {(cartId: uuid) => Promise<number>}
 */
const deleteCartItems = async (cartId) => {
  return await dbContext.cartItems.destroy({
    where: {
      cartId: cartId,
    },
  });
};

module.exports = {
  findById,
  addCart,
  saveCart,
  addCartItem,
  addCartItems,
  saveCartItem,
  deleteCartItem,
  deleteCartItems,
};
