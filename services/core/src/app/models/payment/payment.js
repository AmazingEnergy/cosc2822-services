const { v4: uuidv4 } = require("uuid");
const PaymentStatus = require("./paymentStatus");

class Payment {
  /**
   * @param {uuid} cartId
   * @param {string} paymentReference
   * @param {string} createdBy
   * @param {Date} createdAt
   * @param {string} updatedBy
   * @param {Date} updatedAt
   */
  constructor(
    cartId,
    paymentReference,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt
  ) {
    this.id = uuidv4();
    this.cartId = cartId;
    this.paymentReference = paymentReference;
    this.status = PaymentStatus.New;
    this.createdAt = createdAt || null;
    this.createdBy = createdBy;
    this.updatedAt = updatedAt || null;
    this.updatedBy = updatedBy || null;
  }

  static getAttributes = () => Object.keys(new Payment());

  /**
   * @param value
   * @returns
   * @type {(value: string | undefined)
   * 	=> Payment[]>}
   */
  static fromString = (value) => {
    return JSON.parse(value).map(
      (p) =>
        new Payment(
          p.cartId,
          p.paymentReference,
          p.createdBy,
          p.createdAt !== undefined && p.createdAt !== null
            ? new Date(p.createdAt)
            : p.createdAt,
          p.updatedBy,
          p.updatedAt !== undefined && p.updatedAt !== null
            ? new Date(p.updatedAt)
            : p.updatedAt
        )
    );
  };
}

module.exports = Payment;
