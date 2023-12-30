const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  refreshAccessToken,
  updatePassword,
  getCurrentUser,
  updateFullnameAndEmail,
  updateAvatar,
  updateCoverImage,
  getUserChannelInformation,
  getWatchHistory,
} = require("../controllers/user.controllers");
const { upload } = require("../middlewares/multer.middleware.js");
const { verifyJWT } = require("../middlewares/auth.middleware.js");

const router = express.Router();

router.route("/register").post(
  upload.fields([
    {
      name: "avatar",
      maxCount: 1,
    },
    {
      name: "coverImage",
      maxCount: 1,
    },
  ]),
  registerUser
);

router.route("/login").post(loginUser);
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/refresh-token").post(refreshAccessToken);
router.route("/change-password").post(verifyJWT, updatePassword);
router.route("/current-user").post(verifyJWT, getCurrentUser);
router.route("/change-details").patch(verifyJWT, updateFullnameAndEmail);
router
  .route("/change-avatar")
  .patch(verifyJWT, upload.single("avatar"), updateAvatar);
router
  .route("/change-coverImage")
  .patch(verifyJWT, upload.single("coverImage"), updateCoverImage);
router.route("/channel/:username").get(verifyJWT, getUserChannelInformation);
router.route("/history").get(verifyJWT, getWatchHistory);

module.exports = router;
