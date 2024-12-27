const Joi = require("joi");
const BaseQuery = require("../../../utils/baseQuery");

class ListCartPaymentQuery extends BaseQuery {
  constructor() {
    super(
      Joi.object({
        sessionId: Joi.string().required(),
      })
    );
  }
}

module.exports = ListCartPaymentQuery;
