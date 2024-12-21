class OrderItem {
  /**
   * @param {uuid} orderId
   * @param {string} skuId
   * @param {string} productName
   * @param {string} stockCode
   * @param {number} quantity
   * @param {number} productPrice
   * @param {number} discountPrice
   * @param {Date} createdAt
   * @param {Date} updatedAt
   */
  constructor(
    orderId,
    skuId,
    productName,
    stockCode,
    quantity,
    productPrice,
    discountPrice,
    createdAt,
    updatedAt
  ) {
    this.id = null;
    this.orderId = orderId;
    this.skuId = skuId;
    this.productName = productName;
    this.stockCode = stockCode;
    this.quantity = quantity;
    this.productPrice = productPrice;
    this.discountPrice = discountPrice;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static getAttributes = () => Object.keys(new OrderItem());

  /**
   * @param value
   * @returns
   * @type {(value: string | undefined)
   * 	=> OrderItem[]>}
   */
  static fromString = (value) => {
    return JSON.parse(value).map(
      (oi) =>
        new OrderItem(
          oi.orderId,
          oi.skuId,
          oi.productName,
          oi.stockCode,
          oi.quantity,
          oi.productPrice,
          oi.discountPrice,
          oi.createdAt !== undefined && oi.createdAt !== null
            ? new Date(oi.createdAt)
            : oi.createdAt,
          oi.updatedAt !== undefined && oi.updatedAt !== null
            ? new Date(oi.updatedAt)
            : oi.updatedAt
        )
    );
  };
}

module.exports = OrderItem;
