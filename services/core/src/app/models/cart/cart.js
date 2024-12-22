const { v4: uuidv4 } = require("uuid");

class Cart {
  /**
   * @param {string} customerId
   * @param {string} promotionCode
   * @param {string} createdBy
   * @param {Date} createdAt
   * @param {string} updatedBy
   * @param {Date} updatedAt
   */
  constructor(
    customerId,
    promotionCode,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt
  ) {
    this.id = uuidv4();
    this.customerId = customerId;
    this.promotionCode = promotionCode;
    this.submittedAt = null;
    this.createdBy = createdBy;
    this.createdAt = createdAt || null;
    this.updatedBy = updatedBy;
    this.updatedAt = updatedAt;
  }

  static getAttributes = () => Object.keys(new Cart());

  /**
   * @param value
   * @returns
   * @type {(value: string | undefined)
   * 	=> Cart[]>}
   */
  static fromString = (value) => {
    return JSON.parse(value).map(
      (c) =>
        new Cart(
          c.customerId,
          c.promotionCode,
          c.createdBy,
          c.createdAt,
          c.updatedBy,
          c.updatedAt
        )
    );
  };
}

module.exports = Cart;
