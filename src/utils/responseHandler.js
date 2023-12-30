class responseHandler {
  constructor(data, message = "Success", statusCode) {
    (this.data = data),
      (this.message = message),
      (this.statusCode = statusCode),
      (this.success = statusCode < 400);
  }
}

module.exports = { responseHandler };
