const Joi = require("joi");
const BaseParams = require("../../../utils/baseParams");

class FindCartParams extends BaseParams {
  constructor() {
    super(
      Joi.object({
        id: Joi.string().guid().required(),
      })
    );
  }
}

module.exports = FindCartParams;
