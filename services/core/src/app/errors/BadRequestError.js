class BadRequestError extends Error {
  constructor(message, details) {
    super(message);
    this.status = 400;
    this.message = message;
    this.details = details;
  }
}

module.exports = BadRequestError;
