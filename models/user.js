const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: String,
    username: String,
    password: String,
    year: String,
    date: Date,
    verificationKey: Number,
    isVerified: Boolean,
  },
  { collection: "users" }
);

module.exports = mongoose.model("User", userSchema);
