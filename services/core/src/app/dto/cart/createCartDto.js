const Joi = require("joi");
const BaseDto = require("../../../utils/baseDto");

class CreateCartDto extends BaseDto {
  constructor() {
    super(
      Joi.object({
        createdBy: Joi.string().max(255).empty("").default(null).optional(),
      })
    );
  }
}

module.exports = CreateCartDto;
