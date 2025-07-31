const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/landing.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/login.html"));
});

router.get("/createaccount", (req, res) => {
  res.sendFile(path.join(__dirname, "../public/createaccount.html"));
});

module.exports = router;
