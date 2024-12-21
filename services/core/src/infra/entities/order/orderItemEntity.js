const Sequelize = require("sequelize");

const { db } = require("../../connectors/sequelizeConnector");

const orderEntity = require("./orderEntity");

/**
 * @see https://sequelize.org/docs/v6/core-concepts/model-basics/
 */
const orderItemEntity = db().define("orderItems", {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.literal("(uuid())"),
    allowNull: false,
    primaryKey: true,
  },
  orderId: {
    type: Sequelize.UUID,
    allowNull: false,
  },
  skuId: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  productName: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  stockCode: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  productPrice: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: false,
    validate: {
      min: 0,
    },
  },
  discountPrice: {
    type: Sequelize.DECIMAL(10, 2),
    allowNull: true,
    validate: {
      min: 0,
    },
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
    validator: {
      min: 1,
    },
  },
  createdAt: {
    type: Sequelize.DATE,
    allowNull: false,
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

orderEntity.hasMany(orderItemEntity, {
  onDelete: "RESTRICT",
  onUpdate: "CASCADE",
});

orderItemEntity.belongsTo(orderEntity, {
  foreignKey: "orderId",
});

module.exports = orderItemEntity;
