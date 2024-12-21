const { Request } = require("express");

const { HIDDEN_ROLE_CLAIM } = require("./constants");

/**
 *
 * @param {Request} req
 * @returns {{role: string, userId: string, email: string}}
 */
const extractUserClaims = (req) => {
  if (!req.auth || !req.auth.payload) return {};
  const authPayload = req.auth.payload;
  return {
    role: authPayload[HIDDEN_ROLE_CLAIM],
    userId: authPayload.sub,
    email: authPayload.email,
  };
};

module.exports = {
  extractUserClaims,
};
