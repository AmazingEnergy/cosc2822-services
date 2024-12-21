const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class CompleteOrderDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        completedBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = CompleteOrderDto;
