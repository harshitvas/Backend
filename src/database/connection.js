const mongoose = require("mongoose");
const { DB_NAME } = require("../constants.js");

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGO_URI}/${DB_NAME}`
    );
    console.log(
      "MongoDB CONNECTED SUCCESSFULLY!!",
      connectionInstance.connection.host
    );
  } catch (error) {
    console.log("MongoDB Connection FAILED", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
