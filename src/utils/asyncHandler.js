const asyncHandler = (handlerFunction) => {
  return (req, res, next) => {
    Promise.resolve(handlerFunction(req, res, next)).catch((error) =>
      console.log("AsyncHandler wrapper class error", error)
    );
  };
};

module.exports = { asyncHandler };
