const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class UpdateCartItemDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        customerId: Joi.string().max(255).default(null).optional(),
        firstName: Joi.string().max(255).required(),
        lastName: Joi.string().max(255).required(),
        email: Joi.string().email().max(255).required(),
        updatedBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = UpdateCartItemDto;
