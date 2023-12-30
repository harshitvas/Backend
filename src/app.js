const express = require("express");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    optionsSuccessStatus: 200,
  })
);
// we can also pass the limit as options
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

// routes
const userRouter = require("./routes/user.routes.js");

app.use("/api/v1/user", userRouter);

module.exports = app;
