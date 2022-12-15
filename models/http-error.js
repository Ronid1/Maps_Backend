class HttpError extends Error {
  constructor(message = "something went wrong", errorCode = "500") {
    super(message);
    this.code = errorCode;
  }
}

module.exports = HttpError;