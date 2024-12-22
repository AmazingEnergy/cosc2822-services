const Sequelize = require("sequelize");

const { db } = require("../../connectors/sequelizeConnector");

const cartEntity = require("../cart/cartEntity");

/**
 * @see https://sequelize.org/docs/v6/core-concepts/model-basics/
 */
const paymentEntity = db().define("payments", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.literal("(uuid())"),
    allowNull: false,
    primaryKey: true,
  },
  cartId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  paymentReference: {
    type: Sequelize.STRING(500),
    allowNull: false,
  },
  status: {
    type: Sequelize.STRING(50),
    allowNull: false,
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

cartEntity.hasMany(paymentEntity, {
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

paymentEntity.belongsTo(cartEntity, {
  foreignKey: "cartId",
});

module.exports = paymentEntity;
