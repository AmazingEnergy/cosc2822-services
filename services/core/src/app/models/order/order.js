const OrderStatus = require("./orderStatus");

class Order {
  /**
   * @param {uuid} cartId
   * @param {string} customerId
   * @param {string} contactName
   * @param {string} contactEmail
   * @param {string} contactPhone
   * @param {string} deliveryAddress
   * @param {string} promotionCode
   * @param {OrderStatus} status
   * @param {string} createdBy
   * @param {Date} createdAt
   * @param {string} updatedBy
   * @param {Date} updatedAt
   */
  constructor(
    cartId,
    customerId,
    contactName,
    contactEmail,
    contactPhone,
    deliveryAddress,
    promotionCode,
    status,
    createdBy,
    createdAt,
    updatedBy,
    updatedAt
  ) {
    this.id = null;
    this.cartId = cartId;
    this.customerId = customerId;
    this.contactName = contactName;
    this.contactEmail = contactEmail;
    this.contactPhone = contactPhone;
    this.deliveryAddress = deliveryAddress;
    this.promotionCode = promotionCode;
    this.status = status || OrderStatus.New;
    this.createdAt = createdAt || new Date();
    this.createdBy = createdBy;
    this.updatedAt = updatedAt || null;
    this.updatedBy = updatedBy || null;

    this.orderNumber = Order.getOrderNumber(this);
  }

  static getAttributes = () => Object.keys(new Order());

  static getOrderNumber = (order) => {
    return `ODR-${order.createdAt.getFullYear()}${
      order.createdAt.getMonth() + 1
    }${order.createdAt.getDate()}${("0000" + order.id).slice(-4)}`;
  };

  /**
   * @param value
   * @returns
   * @type {(value: string | undefined)
   * 	=> Order[]>}
   */
  static fromString = (value) => {
    return JSON.parse(value).map(
      (o) =>
        new Order(
          o.cartId,
          o.customerId,
          o.contactName,
          o.contactEmail,
          o.contactPhone,
          o.deliveryAddress,
          o.promotionCode,
          o.status,
          o.createdBy,
          o.createdAt !== undefined && o.createdAt !== null
            ? new Date(o.createdAt)
            : o.createdAt,
          o.updatedBy,
          o.updatedAt !== undefined && o.updatedAt !== null
            ? new Date(o.updatedAt)
            : o.updatedAt
        )
    );
  };
}

module.exports = Order;
