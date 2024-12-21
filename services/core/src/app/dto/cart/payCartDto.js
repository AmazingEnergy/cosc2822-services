const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class PayCartDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        paidBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = PayCartDto;
