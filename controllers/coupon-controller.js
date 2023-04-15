const couponHelper = require("../helpers/coupon-helpers");

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
};
