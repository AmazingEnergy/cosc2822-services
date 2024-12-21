const Joi = require("joi");
const BaseQuery = require("../../../utils/baseQuery");

class ListOrderQuery extends BaseQuery {
  constructor() {
    super(
      Joi.object({
        searchText: Joi.string().optional(),
        sortBy: Joi.string()
          .optional()
          .default("createdAt")
          .valid("createdAt", "status"),
        sortDirection: Joi.string()
          .optional()
          .default("DESC")
          .valid("ASC", "DESC"),
        pageIndex: Joi.number().optional().default(0),
        pageSize: Joi.number().optional().default(10),
      })
    );
  }
}

module.exports = ListOrderQuery;
