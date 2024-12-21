const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class SubmitCartDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        customerId: Joi.string().optional().default(null),
        contactName: Joi.string().max(255).required(),
        contactEmail: Joi.string().max(255).required(),
        contactPhone: Joi.string().max(255).required(),
        deliveryAddress: Joi.string().max(500).required(),
        promotionCode: Joi.string().max(255).optional().default(null),
      })
    );
  }
}

module.exports = SubmitCartDto;
