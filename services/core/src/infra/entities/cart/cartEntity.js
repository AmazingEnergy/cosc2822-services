const Sequelize = require("sequelize");

const { db } = require("../../connectors/sequelizeConnector");

/**
 * @see https://sequelize.org/docs/v6/core-concepts/model-basics/
 */
const cartEntity = db().define("carts", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.literal("(uuid())"),
    allowNull: false,
    primaryKey: true,
  },
  customerId: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  promotionCode: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  submittedAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
  createdBy: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedBy: {
    type: Sequelize.STRING(255),
    allowNull: true,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

module.exports = cartEntity;
