const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class CancelOrderDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        reason: Joi.string().optional(),
        cancelledBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = CancelOrderDto;
