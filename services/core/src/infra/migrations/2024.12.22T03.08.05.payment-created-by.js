const sequelize = require("sequelize");

/**
 * apply migration
 * @param {sequelize.QueryInterface} queryInterface
 * @param {sequelize} Sequelize
 */
async function up(queryInterface, Sequelize) {
  /**
   * @see https://sequelize.org/api/v6/class/src/dialects/abstract/query-interface.js~queryinterface
   *
   * Add altering commands here.
   *
   * Example:
   * await queryInterface.createTable('users', { id: Sequelize.INTEGER });
   */

  await queryInterface.addColumn("payments", "createdBy", {
    type: Sequelize.STRING(255),
    allowNull: false,
  });

  await queryInterface.addColumn("payments", "updatedBy", {
    type: Sequelize.STRING(255),
    allowNull: true,
  });
}

/**
 * revert migration
 * @param {sequelize.QueryInterface} queryInterface
 * @param {sequelize} Sequelize
 */
async function down(queryInterface, Sequelize) {
  /**
   * @see https://sequelize.org/api/v6/class/src/dialects/abstract/query-interface.js~queryinterface
   *
   * Add reverting commands here.
   *
   * Example:
   * await queryInterface.dropTable('users');
   */

  await queryInterface.removeColumn("payments", "createdBy");
  await queryInterface.removeColumn("payments", "updatedBy");
}

module.exports = { up, down };
