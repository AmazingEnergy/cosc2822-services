const Joi = require("joi");
const DtoType = require("./dtoType");

class BaseDto {
  /**
   * @param {Joi.ObjectSchema} validation
   */
  constructor(validation) {
    this.type = DtoType.DTO;
    this.validation = validation ?? Joi.object();
  }
}

module.exports = BaseDto;
