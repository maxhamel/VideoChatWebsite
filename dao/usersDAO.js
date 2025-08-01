const mongodb = require("mongoose");
const User = require("../models/user");
const nodemailer = require("nodemailer");

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
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Welcome to TerpCrawl!",
        text: `Thanks for creating an account! Your verfification code is: ${verificationKey}`,
        html: `<h1>Welcome to TerpCrawl!</h1><p>Your verification code is: <strong>${verificationKey}</strong></p>`,
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          return console.error("Error sending email:", error);
        }
        console.log("Email sent:", info.response);
      });

      return await newUser.save();
    } catch (e) {
      console.error(`Unable to save user: ${e}`);
      return { error: e };
    }
  }
}

module.exports = UsersDAO;
