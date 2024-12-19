class NotFoundError extends Error {
  constructor(message, details) {
    super(message);
    this.status = 404;
    this.message = message;
    this.details = details;
  }
}

module.exports = NotFoundError;
