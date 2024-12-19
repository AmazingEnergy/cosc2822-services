const { Request, Response, NextFunction } = require("express");
const { PROD_ENV, API_PATH } = require("../utils/constants");

/**
 *
 * @param {Error} err
 * @param {Request} req
 * @param {Response} res
 * @param {NextFunction} next
 * @returns
 */
const globalErrorHandler = async (err, req, res, next) => {
  console.log(req.originalUrl);
  console.log(err);
  let status = err.status;
  if (!status) status = err.name === "ValidationError" ? 400 : 500;
  if (req.originalUrl.toLowerCase().startsWith(API_PATH)) {
    res.status(status);
    return res.json({
      status: status,
      msg: err.message,
      error: process.env.NODE_ENV != PROD_ENV ? err.details ?? {} : {},
    });
  }
  return res.redirect(`/${status}`);
};

module.exports = globalErrorHandler;
