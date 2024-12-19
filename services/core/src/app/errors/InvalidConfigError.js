class InvalidConfigError extends Error {
  constructor(message, details) {
    super(message);
    this.status = 500;
    this.message = message;
    this.details = details;
  }
}

module.exports = InvalidConfigError;
