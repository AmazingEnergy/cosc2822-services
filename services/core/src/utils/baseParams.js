const Joi = require("joi");
const DtoType = require("./dtoType");
const BaseDto = require("./baseDto");

class BaseParams extends BaseDto {
  /**
   * @param {Joi.ObjectSchema} validation
   */
  constructor(validation) {
    super(validation);
    this.type = DtoType.PARAMS;
  }
}

module.exports = BaseParams;
