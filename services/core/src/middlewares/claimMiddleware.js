const UnauthorizedError = require("../app/errors/UnauthorizedError");
const ForbiddenError = require("../app/errors/ForbiddenError");

/**
 *
 * @param {string} claim
 * @param {string} containedItem
 * @returns
 */
const claimContains = (claim, containedItem) =>
  toHandler((claims) => {
    if (!claims) throw new UnauthorizedError(`Unauthenticated request`);
    if (!claims[claim]) throw new UnauthorizedError(`Missing ${claim} claim`);
    if (!Array.isArray(claims[claim]))
      throw new UnauthorizedError(`Invalid ${claim} claim`);
    if (!claims[claim].some((c) => c === containedItem))
      throw new ForbiddenError(`Unauthorized request`);
  });

const toHandler = (fn) => (req, res, next) => {
  try {
    fn(req.auth || {});
    next();
  } catch (e) {
    next(e);
  }
};

module.exports = {
  claimContains,
};
