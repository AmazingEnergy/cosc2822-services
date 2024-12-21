const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class AddCartItemDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        skuId: Joi.string().max(255).required(),
        productName: Joi.string().max(255).required(),
        stockCode: Joi.string().max(255).required(),
        quantity: Joi.number().min(1).required(),
        productPrice: Joi.number().min(0).required(),
        discountPrice: Joi.number().min(0).default(null).optional(),
        createdBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = AddCartItemDto;
