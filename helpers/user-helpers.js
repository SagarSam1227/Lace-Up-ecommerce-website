var db = require("../config/connection");
var bcrypt = require("bcrypt");
const users = require("../models/user-model");
const admin = require('../models/admin-model')

module.exports = {
  CHECK_ADMIN:()=>{
    return new Promise(async(resolve,reject)=>{
      const findUser = await admin.find()
      resolve(findUser)
    })
  },

  finding: (skip) => {
    return new Promise(async (resolve, reject) => {
      let findUser = await users.countDocuments().find().limit(8).skip(skip);
     
      console.log('orderNum: ',findUser);
      resolve(findUser);
    });
  },
  addUser: (user,slug) => {
    return new Promise(async (resolve, reject) => {
      let userDetails = new users({
        name: user.username,
        email: user.email,
        contact: user.contact,
        password: user.password,
        status: true,
        slug:slug
      });
      userDetails.save();
      resolve(userDetails);
    });
  },
  updateFalse: (slug) => {
    users.updateOne({ slug: slug }, { status: false }).then((data) => {});
  },

  updateTrue: (slug) => {
    users.updateOne({ slug: slug }, { status: true }).then((data) => {});
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
      resolve(User);
    });
  },
  UPDATE_USER: (user, email) => {
    return new Promise(async (resolve, reject) => {
      const data = await users.findOneAndUpdate(
        {
          email: email,
        },
        {
          name: user.name,
          email: user.email,
          contact: user.phone,
        }
      );
      resolve(data);
    });
  },
  saveAddress: (email, data, id) => {
    const userObj = {
      id: id,
      name: data.name,
      contact: data.contact,
      pincode: data.pincode,
      locality: data.locality,
      address: data.address,
      city: data.city,
      state: data.state,
      landmark: data.landmark,
      contact2: data.contact2,
    };

    return new Promise(async (resolve, reject) => {
      const addressDetails = await users.updateOne(
        { email: email },
        {
          $push: {
            address: userObj,
          },
        }
      );
      resolve(addressDetails);
    });
  },

  removeAddress: (email, id) => {
    return new Promise(async (resolve, reject) => {
      const status = await users.updateOne(
        { email: email },
        { $pull: { address: { id: id } } }
      );
      resolve(true);
    });
  },

  findAddress: async (email, addressId) => {
    return new Promise(async (resolve, reject) => {
      const address = await users.aggregate(
        [
      {
        $match:{'email':email}
      },
      {
        $project:{'address':1}
      },
      {
        $unwind:'$address'
      },
      {
        $match:{'address.id':addressId}
      },
      {
        $project:{'address':1}
      }
        ]
      );
      resolve(address);
    });
  },

};
