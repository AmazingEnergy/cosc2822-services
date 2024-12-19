class ForbiddenError extends Error {
  constructor(message, details) {
    super(message);
    this.status = 403;
    this.message = message;
    this.details = details;
  }
}

module.exports = ForbiddenError;
