if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const fs = require("fs");
const express = require("express");
const bodyParser = require("body-parser");
const mongodb = require("mongoose");
const indexRouter = require("./routes/pages");
const bcrypt = require("bcrypt");
const UsersDAO = require("./dao/usersDAO.js");
const User = require("./models/user");
const path = require("path");

const app = express();

app.use(express.static("docs"));
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

  const usercheck = await User.findOne({ username: req.body.username });
  const emailcheck = await User.findOne({ email: req.body.email });

  let loginPage = fs.readFileSync(
    path.join(__dirname, "docs", "createaccount.html"),
    "utf-8"
  );

  if (usercheck) {
    loginPage = loginPage.replace(
      '<div id="error-message"></div>',
      '<div id="error-message" style="color:red;">Username is already taken</div>'
    );
    return res.send(loginPage);
  }
  if (emailcheck) {
    loginPage = loginPage.replace(
      '<div id="error-message"></div>',
      '<div id="error-message" style="color:red;">Email is already taken</div>'
    );
    return res.send(loginPage);
  }

  const terpmailregex = new RegExp("^[a-z0-9]+@(terpmail\\.)?umd\\.edu$");
  const terpmailflag = terpmailregex.test(email);

  if (!terpmailflag) {
    loginPage = loginPage.replace(
      '<div id="error-message"></div>',
      '<div id="error-message" style="color:red;">Must be a UMD Email'
    );
    return res.send(loginPage);
  }

  await UsersDAO.addUser(email, username, hash, year, date);
  globalEmail = email;
  res.redirect("/emailverification");
});

app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username: req.body.username });
    const validPassword = await bcrypt.compare(password, user.password);

    if (!user || !validPassword) {
      let loginPage = fs.readFileSync(
        path.join(__dirname, "docs", "login.html"),
        "utf-8"
      );
      loginPage = loginPage.replace(
        '<div id="error-message"></div>',
        '<div id="error-message" style="color:red;">Invalid username or password</div>'
      );
      return res.send(loginPage);
    } else {
      res.send("Good job you logged in");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
});

app.post("/email-verification", async (req, res) => {
  const { username, code } = req.body;
  const user = await User.findOne({ username: username });

  let verifyPage = fs.readFileSync(
    path.join(__dirname, "docs", "emailverification.html"),
    "utf-8"
  );

  if (!user) {
    verifyPage = verifyPage.replace(
      '<div id="error-message"></div>',
      '<div id="error-message" style="color:red;">Incorrect Username</div>'
    );
    return res.send(verifyPage);
  }

  const verificationKey = user.verificationKey;

  if (code == verificationKey) {
    const result = await User.updateOne(
      { username: username },
      { $set: { isVerified: true } }
    );
    console.log("Good job you are good and verified");
  } else {
    verifyPage = verifyPage.replace(
      '<div id="error-message"></div>',
      '<div id="error-message" style="color:red;">Incorrect Code</div>'
    );
    return res.send(verifyPage);
  }
});
