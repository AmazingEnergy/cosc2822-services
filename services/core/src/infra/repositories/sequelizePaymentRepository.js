const models = require("../../app/models");
const dbContext = require("../entities");

/**
 * @param cartId
 * @returns
 * @type {(cartId: uuid) => Promise<import("sequelize").Model<any, any>>}
 */
const findByCartId = async (cartId) => {
  return dbContext.payments.findOne({
    where: {
      cartId: cartId,
    },
    attributes: models.Payment.getAttributes(),
  });
};

/**
 * @param payment
 * @returns
 * @type {(profile: import("../../app/models").Payment) => Promise<import("sequelize").Model<any, any>>}
 */
const addPayment = async (payment) => {
  return await dbContext.payments.create(payment);
};

/**
 * @param payment
 * @returns
 * @type {(profile: import("sequelize").Model<any, any>) => Promise<import("sequelize").Model<any, any>>}
 */
const savePayment = async (payment) => {
  return await payment.save();
};

module.exports = {
  findByCartId,
  addPayment,
  savePayment,
};
