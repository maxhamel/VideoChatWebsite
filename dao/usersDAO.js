import mongodb from "mongodb";
const ObjectId = mongodb.ObjectID;

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

let user;

export default class AccountsDAO {
  static async injectDB(conn) {
    if (user) {
      return;
    }
    try {
      user = await conn.db(process.env.DB_NS).collection("reviews");
    } catch (e) {
      console.error(`Unable to establish collection handles in userDAO: ${e}`);
    }
  }

  static async addUser(email, username, password, grade, date) {
    try {
      const user = {
        email: email,
        username: username,
        password: password,
        grade: grade,
        date,
        date,
      };
      return await user.insertOne(user);
    } catch (e) {
      console.error(`Unable to post review: ${e}`);
      return { error: e };
    }
  }
}
