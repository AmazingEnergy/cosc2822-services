const Sequelize = require("sequelize");

const { db } = require("../../connectors/sequelizeConnector");

/**
 * @see https://sequelize.org/docs/v6/core-concepts/model-basics/
 */
const profileEntity = db().define("profiles", {
  customerId: {
    type: Sequelize.STRING(255),
    allowNull: false,
    primaryKey: true,
  },
  firstName: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  lastName: {
    type: Sequelize.STRING(255),
    allowNull: false,
  },
  email: {
    type: Sequelize.STRING(255),
    allowNull: false,
    validate: {
      isEmail: true,
    },
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
    defaultValue: Sequelize.NOW,
  },
  updatedAt: {
    type: Sequelize.DATE,
    allowNull: true,
  },
});

module.exports = profileEntity;
