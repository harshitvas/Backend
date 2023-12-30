const { asyncHandler } = require("../utils/asyncHandler");
const { errorHandler } = require("../utils/errorHandler");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model.js");

const verifyJWT = asyncHandler(async (req, res, next) => {
  try {
    const token =
      req.cookies?.accessToken ||
      req.header("Authorization").replace("Bearer ", "");

    if (!token) {
      throw new errorHandler(400, "No token given");
    }
    const userData = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(userData._id).select(
      "-password -refreshToken"
    );
    if (!user) {
      throw new errorHandler(400, "No user exist with given token");
    }
    req.userDetails = user;
    next();
  } catch (error) {
    throw new errorHandler(400, "Invalid token");
  }
});

module.exports = { verifyJWT };
