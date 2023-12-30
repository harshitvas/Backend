const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
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

module.exports = router;
