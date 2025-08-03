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
const socketio = require("socket.io");
const https = require("https");

const key = fs.readFileSync("cert.key");
const cert = fs.readFileSync("cert.crt");
const app = express();
const expressServer = https.createServer({ key, cert }, app);

const io = socketio(expressServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.static("public"));
app.use("/", indexRouter);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

expressServer.listen(process.env.PORT || 3000);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const offers = [
  // offererUserName
  // offer
  // offerIceCandidates
  // answererUserName
  // answer
  // answererIceCandidates
];
const connectedSockets = [
  //username, socketId
];

io.on("connection", (socket) => {
  const userName = socket.handshake.auth.userName;
  const password = socket.handshake.auth.password;

  if (password !== "x") {
    socket.disconnect(true);
    return;
  }
  connectedSockets.push({
    socketId: socket.id,
    userName,
  });

  //a new client has joined. If there are any offers available,
  //emit them out
  if (offers.length) {
    socket.emit("availableOffers", offers);
  }

  socket.on("newOffer", (newOffer) => {
    offers.push({
      offererUserName: userName,
      offer: newOffer,
      offerIceCandidates: [],
      answererUserName: null,
      answer: null,
      answererIceCandidates: [],
    });

    socket.broadcast.emit("newOfferAwaiting", offers.slice(-1));
  });

  socket.on("newAnswer", (offerObj, ackFunction) => {
    const socketToAnswer = connectedSockets.find(
      (s) => s.userName === offerObj.offererUserName
    );
    if (!socketToAnswer) {
      console.log("No matching socket");
      return;
    }

    const socketIdToAnswer = socketToAnswer.socketId;

    const offerToUpdate = offers.find(
      (o) => o.offererUserName === offerObj.offererUserName
    );
    if (!offerToUpdate) {
      console.log("No OfferToUpdate");
      return;
    }
    ackFunction(offerToUpdate.offerIceCandidates);
    offerToUpdate.answer = offerObj.answer;
    offerToUpdate.answererUserName = userName;

    socket.to(socketIdToAnswer).emit("answerResponse", offerToUpdate);
  });

  socket.on("sendIceCandidateToSignalingServer", (iceCandidateObj) => {
    const { didIOffer, iceUserName, iceCandidate } = iceCandidateObj;
    if (didIOffer) {
      const offerInOffers = offers.find(
        (o) => o.offererUserName === iceUserName
      );
      if (offerInOffers) {
        offerInOffers.offerIceCandidates.push(iceCandidate);

        if (offerInOffers.answererUserName) {
          const socketToSendTo = connectedSockets.find(
            (s) => s.userName === offerInOffers.answererUserName
          );
          if (socketToSendTo) {
            socket
              .to(socketToSendTo.socketId)
              .emit("receivedIceCandidateFromServer", iceCandidate);
          } else {
            console.log("Ice candidate recieved but could not find answere");
          }
        }
      }
    } else {
      const offerInOffers = offers.find(
        (o) => o.answererUserName === iceUserName
      );
      const socketToSendTo = connectedSockets.find(
        (s) => s.userName === offerInOffers.offererUserName
      );
      if (socketToSendTo) {
        socket
          .to(socketToSendTo.socketId)
          .emit("receivedIceCandidateFromServer", iceCandidate);
      } else {
        console.log("Ice candidate recieved but could not find offerer");
      }
    }
  });
});

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
    path.join(__dirname, "public", "createaccount.html"),
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
    let validPassword = false;

    if (user) {
      validPassword = await bcrypt.compare(password, user.password);
    }

    if (!user || !validPassword) {
      let loginPage = fs.readFileSync(
        path.join(__dirname, "public", "login.html"),
        "utf-8"
      );
      loginPage = loginPage.replace(
        '<div id="error-message"></div>',
        '<div id="error-message" style="color:red;">Invalid username or password</div>'
      );
      return res.send(loginPage);
    } else {
      res.redirect("/chat");
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
    path.join(__dirname, "public", "emailverification.html"),
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
