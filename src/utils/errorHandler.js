class errorHandler extends Error {
  constructor(
    statusCode,
    message = "Something went wrong",
    stack,
    errors = []
  ) {
    super(message);
    this.statusCode = statusCode;
    this.stack = stack;
    this.errors = errors;
    this.data = null;
    this.success = false;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = { errorHandler };
