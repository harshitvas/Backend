const mongoose = require("mongoose");

const subscriptionSchema = new mongoose.Schema(
  {
    // jin logo new isko subscribe kiya hai
    subscriber: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // jin channel ko issne subscribe kiya hai
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

const Subscription = mongoose.model("Subscription", subscriptionSchema);

module.exports = Subscription;
