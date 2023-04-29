const couponHelper = require("../helpers/coupon-helpers");
const cartHelper = require("../helpers/cart-helpers");
const { loginCheck } = require("./user-controller");

module.exports = {
  getCoupons: async (req, res) => {
    await couponHelper.GET_COUPONS().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      if (req.path.match("user")) {
        res.render("user/coupons", { user: true, data });
      } else {
        res.render("admin/coupons", { admin: true, data });
      }
    });
  },

  postCoupon: async (req, res) => {
    if ("Amount" in req.body) {
      const schemeObj = {
        type: "Amount",
        amount: req.body.Amount,
      };

      const couponCode = Math.random().toString(36).substring(2, 10);
      await couponHelper
        .POST_COUPON(schemeObj, req.body, couponCode)
        .then((state) => {
          res.redirect("/admin/coupons");
        });
    } else if ("category" in req.body) {
      const schemeObj = {
        type: "Category",
        cat: req.body.category,
        sub: req.body.subcategory,
      };

      const couponCode = Math.random().toString(36).substring(2, 10);
      await couponHelper
        .POST_COUPON(schemeObj, req.body, couponCode)
        .then((state) => {
          res.redirect("/admin/coupons");
        });
    } else {
    }
  },

  checkAmount: (totalAmount, couponAmount) => {
    if (totalAmount >= couponAmount) {
      return true;
    }
    return false;
  },

  addCouponUser: async (coupon, email) => {
    const val = coupon.validity;
    const num = +coupon.number;

    let dt = new Date();

    if (val == "Month") {
      dt.setMonth(dt.getMonth() + num);
    } else {
      dt.setDate(dt.getDate() + num);
    }
    const updatedDate = dt.toLocaleDateString();
    console.log("updated date is : ", updatedDate);

    await couponHelper.POST_COUPON_USER(coupon, updatedDate, email);
    await couponHelper.UPDATE_USER_LIST(coupon.code, email);
  },

  getMyCoupons: async (req, res) => {
    await couponHelper.GET_PERSON_COUPON(req.session.email).then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("user/my-coupon", { user: true, data });
    });
  },

  applyCoupon: async (req, res) => {
    const id = req.body.id;
    const couponCode = req.body.couponCode.trim();
    const Total = req.body.totalAmount;

    const result = await couponHelper.GET_COUPON_WITH_CODE(
      couponCode,
      req.session.email
    );

    if (result) {
      req.session.coupon = +result.discount;
      req.session.Total = Math.floor(
        Total - (Total * req.session.coupon) / 100
      );

      console.log(req.session.coupon, "coupon isssss thissss");

      await couponHelper
        .REMOVE_MY_COUPON(couponCode, req.session.email)
        .then(res.json({ coupon: req.session.coupon }));
    }

    // await cartHelper.GET_ONE_CART(id).then((result)=>{
    //   const data = JSON.parse(JSON.stringify(result));
    //   console.log('cart is: ',data);
    // })
  },

  checkUserlist: async (coupon, email) => {
    await couponHelper.CHECK_USERLIST(coupon.code, email).then((data) => {
      console.log("coupon existing or not : ", data);
      if(data===null)return false
      return true
    });
  },
};
