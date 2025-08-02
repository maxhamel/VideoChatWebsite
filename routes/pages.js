const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../docs/index.html"));
});

router.get("/login", (req, res) => {
  res.sendFile(path.join(__dirname, "../docs/login.html"));
});

router.get("/createaccount", (req, res) => {
  res.sendFile(path.join(__dirname, "../docs/createaccount.html"));
});

router.get("/emailverification", (req, res) => {
  res.sendFile(path.join(__dirname, "../docs/emailverification.html"));
});

module.exports = router;
