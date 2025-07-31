if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const bodyParser = require("body-parser");
const mongodb = require("mongoose");
const indexRouter = require("./routes/pages");
app.use(express.static("public"));

const MongoClient = mongodb.MongoClient;

mongodb
  .connect(process.env.DATABASE_URL)
  .catch((err) => {
    console.error(err.stack);
    process.exit(1);
  })
  .then(async (client) => {
    await UsersDAO.injectDB(client);
    app.listen(port, () => {
      console.log(`listening on port ${port}`);
    });
  });

const db = mongodb.connection;
db.on("error", (error) => console.error(error));
db.on("open", () => console.log("Connected to mongodb"));

app.use("/", indexRouter);
app.listen(process.env.PORT || 3000);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post("/register", async (req, res) => {
  date = Date();
  const { email, username, password, grade, date } = req.body;
  console.log("Received:", username, password);
  await UsersDAO.addUser(email, username, password, grade, date);
  res.send("Form submitted!");
});
