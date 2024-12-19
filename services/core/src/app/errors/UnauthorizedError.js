class UnauthorizedError extends Error {
  constructor(message, details) {
    super(message);
    this.status = 401;
    this.message = message;
    this.details = details;
  }
}

module.exports = UnauthorizedError;
