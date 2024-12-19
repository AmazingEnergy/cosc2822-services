const { Request, Response, NextFunction } = require("express");
const UrlPattern = require("url-pattern");
const jwt = require("jsonwebtoken");
const { getSecretValue } = require("../infra/connectors/awsConnector");
const {
  cognitoExpressSession,
} = require("../infra/connectors/cognitoConnector");

/**
 *
 * @param {Error} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns
 */
const auth = async (req, res, next) => {
  console.log("auth middleware", req);

  let loginEndpoint = new UrlPattern("/login");
  if (loginEndpoint.match(req.path)) {
    const redirectUrl = await constructHostedURL();
    res.writeHead(302, {
      Location: redirectUrl,
      //add other headers here...
    });
    res.end();
    return;
  }

  try {
    req.auth = {};
    req.auth.isAuth = false;

    let token = req.cookies.jwt;
    if (!token || isTokenExpire(token)) {
      let publicEndpoints = process.env.APP_PUBLIC_ENDPOINTS.split(",").map(
        (endpoint) => new UrlPattern(endpoint)
      );

      if (publicEndpoints.some((endpoint) => endpoint.match(req.path) !== null))
        return next();

      const redirectUrl = await constructHostedURL();
      res.writeHead(302, {
        Location: redirectUrl,
        //add other headers here...
      });
      res.end();
      return;
    }

    // const session = await cognitoExpressSession();
    // const response = await session.validate(token);
    let response = jwt.decode(token);
    req.auth.userId = response.sub;
    req.auth.username = response["email"];
    req.auth.groups = response["cognito:groups"] || [];
    req.auth.isAuth = true;
    next();
  } catch (error) {
    console.error(error);
    next();
  }
};

const constructHostedURL = async () => {
  let url = "";
  let userPoolId = getSecretValue(process.env.COGNITO_USER_POOL_ID_SECRET_NAME);
  let clientId = getSecretValue(
    process.env.COGNITO_USER_POOL_CLIENT_ID_SECRET_NAME
  );
  let redirectUri = getSecretValue(
    process.env.COGNITO_USER_POOL_REDIRECT_URI_SECRET_NAME
  );
  let domain = getSecretValue(process.env.COGNITO_DOMAIN_SECRET_NAME);

  if (domain && userPoolId && redirectUri && redirectUri) {
    //
  } else {
    return null;
  }

  url += domain;
  url += "/login?client_id=";
  url += clientId;
  url += "&response_type=token";
  url += "&scope=email openid phone";
  url += "&redirect_uri=";
  url += encodeURIComponent(redirectUri);

  return url;
};

/**
 *
 * @param {string} token
 * @returns
 * @type {(token: string) => boolean}
 */
const isTokenExpire = (token) => {
  const decoded = jwt.decode(token);
  const exp = decoded.exp;
  if (exp < new Date() / 1000) {
    return true;
  }
  return false;
};

module.exports = {
  auth,
};
