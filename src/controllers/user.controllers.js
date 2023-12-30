const { asyncHandler } = require("../utils/asyncHandler.js");
const { errorHandler } = require("../utils/errorHandler.js");
const { uploadOnCloud } = require("../utils/cloudinary.js");
const { responseHandler } = require("../utils/responseHandler.js");
const User = require("../models/user.model.js");

const registerUser = asyncHandler(async (req, res) => {
  // TODO-DONE: Take all details from user through body -> fullname, username, password, email, avatar, coverImage(if given)
  // TODO-DONE: Validation of the information given -> whether all required details given or not -> fullname, email, password, username, avatar
  // TODO-DONE: Check whether the user already exist or not with given username or email
  // TODO-DONE: if user already exist return a message "User already exist with given ID"
  // TODO-DONE: Store avator locally for temporary on server before uploading on cloudinary and same for coverImage, and then upload on cloudinary
  // TODO-DONE: check whether image gets upload on cloudinary or not
  // TODO-DONE: create user -> fullname, email, password, username, avatarCloudURL, coverImageCloudURL(if given)
  // TODO-DONE: check for user creation and return response

  const { fullname, username, email, password } = req.body;
  if (
    [fullname, username, email, password].some((field) => field?.trim() === "")
  ) {
    throw new errorHandler(400, `All fields are required`);
  }

  // find a user whether having same username or email because both should be unique in our database
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existedUser) {
    throw new errorHandler(
      409,
      "User already exist with given username or email ID"
    );
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;

  // using if for coverImage because if we are not given it the coverImage then it will not create a entry with that name therefore can given error if not pass it as input
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files?.coverImage) &&
    req.files?.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files?.coverImage[0]?.path;
  }

  if (!avatarLocalPath) {
    throw new errorHandler(
      400,
      "Something went wrong while uploading file on cloud"
    );
  }

  const avatarCloudResponse = await uploadOnCloud(avatarLocalPath);
  const coverImageCloudResponse = await uploadOnCloud(coverImageLocalPath);

  if (!avatarCloudResponse) {
    throw new errorHandler(
      400,
      "Something went wrong while uploading file on cloud"
    );
  }

  const newUser = await User.create({
    fullname,
    email: email.toLowerCase(),
    password,
    username: username.toLowerCase(),
    avatar: avatarCloudResponse.url,
    coverImage: coverImageCloudResponse?.url || "",
  });

  const userCreated = await User.findById(newUser._id).select(
    "-password -refreshToken"
  );

  if (!userCreated) {
    throw new errorHandler("New user not created, try again!!");
  }

  return res
    .status(200)
    .json(
      new responseHandler(201, userCreated, "User registered successfully!!")
    );
});

module.exports = { registerUser };
