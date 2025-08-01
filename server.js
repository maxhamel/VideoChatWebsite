if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const mongodb = require("mongoose");
const indexRouter = require("./routes/pages");
const bcrypt = require("bcrypt");
const UsersDAO = require("./dao/usersDAO.js");
const User = require("./models/user");

app.use(express.static("public"));
app.use("/", indexRouter);
app.listen(process.env.PORT || 3000);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

mongodb.connect(process.env.DATABASE_URL);
const db = mongodb.connection;

db.on("error", (error) => console.error(error));
db.on("open", () => console.log("Connected to mongodb"));

app.post("/register", async (req, res) => {
  date = new Date();
  const { email, username, password, year } = req.body;
  const hash = await bcrypt.hash(password, 13);
  console.log("Received:", email, username, hash, year, date);
  await UsersDAO.addUser(email, username, hash, year, date);
  res.send("Form submitted!");
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});
