const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class RejectOrderDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        reason: Joi.string().optional(),
        rejectedBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = RejectOrderDto;
