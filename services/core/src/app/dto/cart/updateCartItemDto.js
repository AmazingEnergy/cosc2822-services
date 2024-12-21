const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class UpdateCartItemDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        skuId: Joi.string().max(255).required(),
        quantity: Joi.number().min(1).default(null).optional(),
        discountPrice: Joi.number().min(0).default(null).optional(),
        updatedBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = UpdateCartItemDto;
