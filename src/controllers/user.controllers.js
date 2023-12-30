const { asyncHandler } = require("../utils/asyncHandler.js");
const { errorHandler } = require("../utils/errorHandler.js");
const { uploadOnCloud } = require("../utils/cloudinary.js");
const { responseHandler } = require("../utils/responseHandler.js");
const User = require("../models/user.model.js");
const jwt = require("jsonwebtoken");

const generateAccessAndRefreshToken = async (user_id) => {
  try {
    const user = await User.findById(user_id);
    const accessToken = await user.generateAccessToken();
    const refreshToken = await user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new errorHandler(
      500,
      "Something went wrong while generating access and refresh tokens"
    );
  }
};

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

const loginUser = asyncHandler(async (req, res) => {
  // TODO-DONE: Take details of user through body -> username, email, password
  // TODO-DONE: validation of user's input
  // TODO-DONE: check whether the user exist in the database of not
  // TODO-DONE: if user don't exist return a message "User don't exist with given ID"
  // TODO-DONE: else check the user entered password and password saved in database
  // TODO-DONE: generate access token and refresh token
  // TODO-DONE: save refresh token into user's detail database
  // TODO-DONE: and save access token in browser's cookie
  // TODO-DONE: return the response of the user without password and refresh token

  const { username, email, password } = req.body;
  if ([username, email, password].some((field) => field?.trim() === "")) {
    throw new errorHandler(400, "All fields are required");
  }

  const existedUser = await User.findOne({ $or: [{ username }, { email }] });
  if (!existedUser) {
    throw new errorHandler(400, "No user exist with given username or ID");
  }

  const isPasswordValid = await existedUser.matchPassword(password);
  if (!isPasswordValid) {
    throw new errorHandler(400, "Password and ID don't match");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
    existedUser._id
  );

  const user = await User.findById(existedUser._id).select(
    "-password -refreshToken"
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new responseHandler(
        200,
        { user: user, accessToken, refreshToken },
        "User logged in successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  // TODO-DONE: take user's id through middleware
  // TODO-DONE: reset refresh token to ""
  // TODO-DONE: delete cookie having access and refresh tokens
  // TODO-DONE: return response with a message "User Logged out successfully"
  await User.findByIdAndUpdate(
    req.userDetails?._id,
    {
      $set: { refreshToken: "" },
    },
    { new: true }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new responseHandler({}, "User logged out successfully", 200));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body?.refreshToken;

  if (!incomingToken) {
    throw new errorHandler(401, "Unauthorized request on server");
  }

  try {
    const userData = await jwt.verify(
      incomingToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(userData?._id);

    if (!user) {
      throw new errorHandler(401, "No use exist with given refresh token");
    }

    if (incomingToken !== user?.refreshToken) {
      throw new errorHandler(401, "Tokens don't match");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user._id
    );

    const options = {
      httpOnly: true,
      secure: true,
    };

    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new responseHandler(
          {},
          { accessToken, refreshToken },
          "New tokens created",
          200
        )
      );
  } catch (error) {
    throw new errorHandler(
      400,
      "Something went wrong while re-generating tokens"
    );
  }
});

module.exports = { registerUser, loginUser, logoutUser, refreshAccessToken };
