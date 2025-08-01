const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, unique: true },
    username: { type: String, unique: true },
    password: String,
    year: String,
    date: Date,
    verificationKey: Number,
    isVerified: Boolean,
  },
  { collection: "users" }
);

module.exports = mongoose.model("User", userSchema);
