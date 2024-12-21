const { auth } = require("express-oauth2-jwt-bearer");
const { getSecretValue } = require("./infra/connectors/awsConnector");

/**
 * @see guide https://auth0.com/docs/quickstart/backend/nodejs/01-authorization#configure-the-middleware
 * @see sample https://github.com/auth0/node-oauth2-jwt-bearer/blob/main/packages/examples/express-api.ts
 */
const jwtCheck = auth({
  audience: getSecretValue(process.env.AUTH_AUDIENCE_SECRET_NAME),
  issuerBaseURL: getSecretValue(process.env.AUTH_ISSUER_SECRET_NAME),
  tokenSigningAlg: process.env.AUTH_TOKEN_SIGNING_ALG,
});

module.exports = jwtCheck;
