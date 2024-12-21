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

  await queryInterface.createTable("profiles", {
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

  await queryInterface.addIndex("profiles", ["email"], {
    name: "profiles_email_index",
    unique: true,
  });

  await queryInterface.createTable("carts", {
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

  await queryInterface.createTable("cartItems", {
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
    skuId: {
      type: Sequelize.STRING(255),
      allowNull: false,
    },
    productName: {
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
      validate: {
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

  await queryInterface.addConstraint("cartItems", {
    fields: ["cartId"],
    type: "FOREIGN KEY",
    name: "fk_item_cart_id",
    references: {
      table: "carts",
      field: "id",
    },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  await queryInterface.createTable("payments", {
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

  await queryInterface.addConstraint("payments", {
    fields: ["cartId"],
    type: "FOREIGN KEY",
    name: "fk_payment_cart_id",
    references: {
      table: "carts",
      field: "id",
    },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  });

  await queryInterface.createTable("orders", {
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

  await queryInterface.createTable("orderItems", {
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

  await queryInterface.addConstraint("orderItems", {
    fields: ["orderId"],
    type: "FOREIGN KEY",
    name: "fk_order_id",
    references: {
      table: "orders",
      field: "id",
    },
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
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

  await queryInterface.dropTable("orderItems");
  await queryInterface.dropTable("orders");
  await queryInterface.dropTable("payments");
  await queryInterface.dropTable("cartItems");
  await queryInterface.dropTable("carts");
  await queryInterface.dropTable("profiles");
}

module.exports = { up, down };
