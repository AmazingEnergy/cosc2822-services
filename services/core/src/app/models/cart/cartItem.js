const { v4: uuidv4 } = require("uuid");

class CartItem {
  /**
   * @param {uuid} cartId
   * @param {string} skuId
   * @param {string} productName
   * @param {number} productPrice
   * @param {number} discountPrice
   * @param {string} stockCode
   * @param {number} quantity
   * @param {Date} createdAt
   * @param {Date} updatedAt
   */
  constructor(
    cartId,
    skuId,
    productName,
    productPrice,
    discountPrice,
    stockCode,
    quantity,
    createdAt,
    updatedAt
  ) {
    this.id = uuidv4();
    this.cartId = cartId;
    this.skuId = skuId;
    this.productName = productName;
    this.productPrice = productPrice;
    this.discountPrice = discountPrice;
    this.stockCode = stockCode;
    this.quantity = quantity;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  static getAttributes = () => Object.keys(new CartItem());

  /**
   * @param value
   * @returns
   * @type {(value: string | undefined)
   * 	=> CartItem[]>}
   */
  static fromString = (value) => {
    return JSON.parse(value).map(
      (ci) =>
        new CartItem(
          ci.cartId,
          ci.skuId,
          ci.productName,
          ci.productPrice,
          ci.discountPrice,
          ci.stockCode,
          ci.quantity,
          ci.createdAt,
          ci.updatedAt
        )
    );
  };
}

module.exports = CartItem;
