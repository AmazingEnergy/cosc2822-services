const { Request } = require("express");

const { HIDDEN_ROLE_CLAIM, HIDDEN_USR_CLAIM } = require("./constants");

/**
 *
 * @param {Request} req
 * @returns {{role: string, userId: string, userName: string, email: string}}
 */
const extractUserClaims = (req) => {
  if (!req.auth || !req.auth.payload) return {};
  const authPayload = req.auth.payload;
  return {
    role: authPayload[HIDDEN_ROLE_CLAIM],
    userId: authPayload.sub,
    userName: authPayload[HIDDEN_USR_CLAIM],
    email: authPayload.email,
  };
};

module.exports = {
  extractUserClaims,
};
