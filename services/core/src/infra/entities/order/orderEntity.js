const Sequelize = require("sequelize");

const { db } = require("../../connectors/sequelizeConnector");

/**
 * @see https://sequelize.org/docs/v6/core-concepts/model-basics/
 */
const orderEntity = db().define("orders", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.literal("(uuid())"),
    allowNull: false,
    primaryKey: true,
  },
  orderNumber: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  cartId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  customerId: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  contactName: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  contactEmail: {
    type: Sequelize.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  contactPhone: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  deliveryAddress: {
    type: Sequelize.STRING(500),
    allowNull: false,
  },
  promotionCode: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  status: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  createdBy: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  updatedBy: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.fn("NOW"),
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

module.exports = orderEntity;
