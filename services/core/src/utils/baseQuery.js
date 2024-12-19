const Joi = require("joi");
const DtoType = require("./dtoType");
const BaseDto = require("./baseDto");

class BaseQuery extends BaseDto {
  /**
   * @param {Joi.ObjectSchema} validation
   */
  constructor(validation) {
    super(validation);
    this.type = DtoType.QUERY;
  }
}

module.exports = BaseQuery;
