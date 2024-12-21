const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class RemoveCartItemDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        skuId: Joi.string().max(255).required(),
        removedBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = RemoveCartItemDto;
