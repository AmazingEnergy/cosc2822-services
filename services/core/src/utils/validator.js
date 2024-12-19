const Joi = require("joi");

/**
 * validate `req.body`
 * @param {Joi.ObjectSchema<any>} dto
 * @returns
 */
module.exports.validateBody = (dto) => {
  return async (req, res, next) => {
    try {
      let value = await dto.validateAsync(req.body);
      req.body = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * validate `req.query`
 * @param {Joi.ObjectSchema<any>} dto
 * @returns
 */
module.exports.validateQuery = (dto) => {
  return async (req, res, next) => {
    try {
      let value = await dto.validateAsync(req.query);
      req.query = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};

/**
 * validate `req.params`
 * @param {Joi.ObjectSchema<any>} dto
 * @returns
 */
module.exports.validateParam = (dto) => {
  return async (req, res, next) => {
    try {
      let value = await dto.validateAsync(req.params);
      req.params = value;
      next();
    } catch (err) {
      next(err);
    }
  };
};
