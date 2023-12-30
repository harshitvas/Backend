const { connectDB } = require("./database/connection.js");
require("dotenv").config({ path: "./.env" });
const app = require("./app.js");

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log(
        "Something went wrong with express while connecting to MongoDB",
        error
      );
      throw error;
    });
    const port = process.env.PORT || 8000;
    app.listen(port, () =>
      console.log(`Server running successfully on PORT: ${port}`)
    );
  })
  .catch((error) => {
    console.log("Something went wrong while connecting with MongoDb", error);
    throw error;
  });
