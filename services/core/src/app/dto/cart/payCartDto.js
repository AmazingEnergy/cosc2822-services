const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class PayCartDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        returnUrl: Joi.string().max(255).optional().default(null),
        paidBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = PayCartDto;
