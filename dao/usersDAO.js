const mongodb = require("mongoose");
const User = require("../models/user");

const ObjectId = mongodb.ObjectID;

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

class UsersDAO {
  static async addUser(email, username, password, year, date) {
    try {
      // Generates a 6 didgit number for email verification
      const verificationKey = Math.floor(100000 + Math.random() * 900000);
      const isVerified = false;
      const newUser = new User({
        email,
        username,
        password,
        year,
        date,
        verificationKey,
        isVerified,
      });
      return await newUser.save();
    } catch (e) {
      console.error(`Unable to save user: ${e}`);
      return { error: e };
    }
  }
}

module.exports = UsersDAO;
