var db = require("../config/connection");
var bcrypt = require("bcrypt");
const users = require("../models/user-model");

module.exports = {
  finding: () => {
    return new Promise(async (resolve, reject) => {
      let findUser = await users.find();
      resolve(findUser);
    });
  },
  addUser: (user) => {
    return new Promise(async (resolve, reject) => {
      let userDetails = new users({
        name: user.username,
        email: user.email,
        contact: user.contact,
        password: user.password,
        status: true,
      });
      userDetails.save();
      resolve(userDetails);
    });
  },
  updateFalse: (id) => {
    users.updateOne({ _id: id }, { status: false }).then((data) => {});
  },

  updateTrue: (id) => {
    users.updateOne({ _id: id }, { status: true }).then((data) => {});
  },
  otpLogin: (mobile) => {
    return new Promise(async (resolve, reject) => {
      let finduser = await users.findOne({ contact: mobile });
      resolve(finduser);
    }); 
  },
 
  findUser: (email) => {
    return new Promise(async (resolve, reject) => {
      const User = await users.findOne({ email: email });
      console.log(User);
      resolve(User);
    });
  },
};
