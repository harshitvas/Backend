const { v2: cloudinary } = require("cloudinary");
const fs = require("fs");

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const uploadOnCloud = async (localFilePath) => {
  if (!localFilePath) {
    console.log("File path is not correct");
    return null;
  }
  try {
    const cloudResponse = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    return cloudResponse;
  } catch (error) {
    fs.unlinkSync(localFilePath);
    console.log("Something went wrong while uploading file on cloud", error);
    return null;
  }
};

module.exports = { uploadOnCloud };
