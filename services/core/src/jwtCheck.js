const { auth } = require("express-oauth2-jwt-bearer");

/**
 * @see guide https://auth0.com/docs/quickstart/backend/nodejs/01-authorization#configure-the-middleware
 * @see sample https://github.com/auth0/node-oauth2-jwt-bearer/blob/main/packages/examples/express-api.ts
 */
const jwtCheck = auth({
  audience: process.env.AUTH_AUDIENCE,
  issuerBaseURL: process.env.AUTH_JWT_ISSUER,
  tokenSigningAlg: "RS256",
});

module.exports = jwtCheck;
