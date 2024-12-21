const Joi = require("joi");
const BaseParams = require("../../../utils/baseParams");

class FindOrderParams extends BaseParams {
  constructor() {
    super(
      Joi.object({
        id: Joi.string().guid().required(),
      })
    );
  }
}

module.exports = FindOrderParams;
