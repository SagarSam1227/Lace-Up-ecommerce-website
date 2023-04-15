var productHelper = require("../helpers/product-helpers");
const adminController = require("../controllers/admin-controller");
const userHelper = require("../helpers/user-helpers");
const { find } = require("../models/product-model");
const cartHelper = require("../helpers/cart-helpers");
const bcrypt = require("bcrypt");
const twilio = require("twilio");
const sendOtp = require("../middlewares/twilio");
const { Enqueue } = require("twilio/lib/twiml/VoiceResponse");
const ALERTS = require("../config/enums");
const orderHelper = require("../helpers/order-helpers");
const walletHelper = require('../helpers/wallet-helpers')

module.exports = {
  userHome: async (req, res) => {
    if (req.session.email) {
      const count = await cartHelper.getTotalCount(req.session.email);

      req.session.count = count;

      adminController.displayProducts(req, res, (Session = true));
    } else {
      adminController.displayProducts(req, res);
    }
  },
  login_Page: (req, res) => {
    res.render("user/login", {
      loginPage: true,
      Err: req.session.Err,
      Block: req.session.Block,
    });
    req.session.Err = false;
    req.session.Block = false;
  },
  signUp_Page: (req, res) => {
    res.render("user/signup", { loginPage: true });
  },
  sessionDestroy: (req, res) => {
    req.session.email = null;
    res.redirect("/");
  },

  each_Product_Details: (req, res) => {
    let id = req.params.id;
    productHelper.findOneProduct(id).then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      if (req.session.email) {
        res.render("user/productDetails", {
          user: req.session.email,
          data,
          count: req.session.count,
        });
      } else {
        res.render("user/productDetails", { data });
      }
    });
  },

  postSignup: async (req, res) => {
    let data = req.body;
    await cartHelper.CREATE_CART(data);
    await walletHelper.CREATE_WALLET(data);
    userHelper.addUser(data).then(res.redirect("/login"));
  },

  loginCheck: (req, res, next) => {
    let data = req.body.email;
    let plaintextPassword = req.body.password;
    productHelper.findUser(data).then((data) => {
      if (data) {
        let hash = data.password;
        bcrypt.compare(plaintextPassword, hash, function (err, result) {
          if (!result) {
            req.session.Err = ALERTS.ERR;
            res.redirect("/login");
          } else {
            if (data.status == true) {
              next();
            } else {
              req.session.Block = ALERTS.BLOCK;
              res.redirect("/login");
            }
          }
        });
      } else {
        req.session.Err = ALERTS.ERR;
        res.redirect("/login");
      }
    });
  },

  display_OTP_loginPage: (req, res) => {
    res.render("user/otp-Login", {
      loginPage: true,
      accErr: req.session.accountErr,
      stsErr: req.session.statusErr,
    });

    req.session.accountErr = false;
    req.session.statusErr = false;
  },

  OTP_Login: (req, res) => {
    userHelper.otpLogin(req.body.mobile).then((user) => {
      if (user == null) {
        req.session.accountErr = ALERTS.ACCOUNT_ERR;
        res.redirect("/otp-login");
      } else {
        if (!user.status) {
          req.session.statusErr = ALERTS.STATUS_ERR;
          res.redirect("/otp-login");
        } else if (user !== null) {
          sendOtp.send_otp(user.contact).then((response) => {
            req.session.mobile = req.body.mobile;
            res.redirect("/otp-varification");
          });
        }
      }
    });
  },
  display_OTP_verificationPage: (req, res) => {
    if (req.session.otpErr) {
      res.render("user/otp-verify", {
        loginPage: true,
        otpErr: req.session.otpErr,
      });
    } else {
      res.render("user/otp-verify", { loginPage: true });
    }
  },

  OTP_verification: async (req, res) => {
    try {
      let mobile = req.session.mobile;
      let otp = req.body.otp;
      sendOtp.verifying_otp(mobile, otp).then((varification) => {
        if (varification.status == "approved") {
          req.session.email = mobile;
          res.redirect("/");
        } else {
          req.session.otpErr = "Invalid Otp";
          res.redirect("/otp-varification");
        }
      });
    } catch (err) {
      console.log(`error: ${err}`);
    }
  },

  getAccountPage: (req, res) => {
    userHelper.findUser(req.session.email).then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      const addressList = JSON.parse(JSON.stringify(result.address));
      res.render("user/account-Details", {
        user: req.session.email,
        data,
        addressList,
        exist: req.session.exist,
      });
      req.session.exist = false;
    });
  },

  updateUser: async (req, res) => {
    if (req.session.email !== req.body.email) {
      const status = await userHelper.findUser(req.body.email);

      if (status) {
        req.session.exist = ALERTS.EXIST;
        res.redirect("/user-account");
      } else {
        userHelper
          .UPDATE_USER(req.body, req.session.email)
          .then(res.redirect("/user-account"));
      }
    } else {
      userHelper
        .UPDATE_USER(req.body, req.session.email)
        .then(res.redirect("/user-account"));
    }
  },

  addAddress: (req, res) => {
    const id = "id" + Math.random().toString(16).slice(2);
    userHelper
      .saveAddress(req.session.email, req.body, id)
      .then(res.redirect("/user-account"));
  },
  addAddressInpayment: (req, res) => {
    const id = "id" + Math.random().toString(16).slice(2);
    userHelper
      .saveAddress(req.session.email, req.body, id)
      .then(res.redirect("/check-payment"));
  },

  deleteAddress: async (req, res) => {
    const id = req.params.id;
    await userHelper
      .removeAddress(req.session.email, id)
      .then(res.redirect("/user-account"));
  },
};
