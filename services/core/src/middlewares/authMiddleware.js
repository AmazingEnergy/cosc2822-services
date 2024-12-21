const { Request, Response, NextFunction } = require("express");
const UrlPattern = require("url-pattern");
const jwt = require("jsonwebtoken");
const { getSecretValue } = require("../infra/connectors/awsConnector");
const UnauthorizedError = require("../app/errors/UnauthorizedError");

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

  try {
    req.auth = {};
    req.auth.isAuth = false;

    let authHeader = req.headers["authorization"];
    if (!authHeader) {
      if (isPublicEndpoint(req)) {
        return next();
      }

      res.status(401);
      res.json({ status: 401, msg: "Unauthorized: token is required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token || isTokenExpire(token)) {
      if (isPublicEndpoint(req)) {
        return next();
      }

      res.json({
        status: 401,
        msg: "Unauthorized: token is invalid or expired",
      });
      return;
    }

    req.auth.payload = jwt.decode(token);
    jwtIssuer = getSecretValue(process.env.AUTH_ISSUER_SECRET_NAME);
    jwtAudience = getSecretValue(process.env.AUTH_AUDIENCE_SECRET_NAME);
    if (req.auth.payload.iss !== jwtIssuer) {
      res.status(401);
      res.json({ status: 401, msg: "Unauthorized: invalid issuer" });
      return;
    }
    if (req.auth.payload.aud !== jwtAudience) {
      res.status(401);
      res.json({ status: 401, msg: "Unauthorized: invalid audience" });
      return;
    }
    req.auth.isAuth = true;
    next();
  } catch (error) {
    console.log("auth error", error);
    res.status(401);
    res.json({ status: 401, msg: "Unauthorized: token is invalid" });
  }
};

const isPublicEndpoint = (req) => {
  let publicEndpoints = process.env.APP_PUBLIC_ENDPOINTS.split(",").map(
    (endpoint) => new UrlPattern(endpoint)
  );
  return publicEndpoints.some((endpoint) => endpoint.match(req.path) !== null);
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
