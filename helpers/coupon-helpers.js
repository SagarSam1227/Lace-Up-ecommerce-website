const Coupon = require("../models/coupon-model");

module.exports = {
  POST_COUPON: (schemeObj, coupon, code) => {
    return new Promise(async (resolve, Reject) => {
      const couponDetails = await Coupon({
        scheme: schemeObj,
        discount: coupon.discount,
        validity: coupon.day,
        number: coupon.number,
        code: code,
        person: "admin",
      });
      couponDetails.save();
      resolve(couponDetails);
    });
  },

  GET_COUPONS: () => {
    return new Promise(async (resolve, reject) => {
      const data = await Coupon.find({
        person: "admin",
      });
      resolve(data);
    });
  },

  GET_PERSON_COUPON: (person) => {
    return new Promise(async (resolve, reject) => {
      const data = await Coupon.find({ person: person });
      resolve(data);
    });
  },

  POST_COUPON_USER: (coupon, validity, email) => {
    return new Promise(async (resolve, Reject) => {
      const couponDetails = await Coupon({
        discount: coupon.discount,
        validity: validity,
        code: coupon.code,
        person: email,
      });
      couponDetails.save();
      console.log("details of coupon----", couponDetails);
      resolve(couponDetails);
    });
  },

  GET_COUPON_WITH_CODE: (couponCode, email) => {
    console.log(couponCode, email);
    return new Promise(async (resolve, reject) => {
      const couponDetails = await Coupon.findOne({
        person: email,
        code: couponCode,
      });
      console.log("details are : ", couponDetails);
      resolve(couponDetails);
    });
  },

  UPDATE_USER_LIST: (couponCode, email) => {
    return new Promise(async (resolve, reject) => {
      const status = await Coupon.updateOne(
        {
          code: couponCode,
          person: "admin",
        },
        {
          $push: { userlist: email },
        }
      );
      resolve(status);
    });
  },

  CHECK_USERLIST: (couponCode, email) => {
    return new Promise(async (resolve, reject) => {
      const status = await Coupon.findOne({
        $and: [
          {
            person: "admin",
            code: couponCode,
          },
          {
            userlist: { $in: [email] },
          },
        ],
      });
      resolve(status);
    });
  },

  REMOVE_MY_COUPON: (couponCode, email) => {
    return new Promise(async (resolve, reject) => {
      const status = await Coupon.findOneAndDelete({
        person: email,
        code: couponCode,
      });
      resolve(status);
    });
  },
};
