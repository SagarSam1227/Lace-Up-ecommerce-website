const cartHelper = require("../helpers/cart-helpers");
const userHelper = require("../helpers/user-helpers");
const productHelper = require("../helpers/product-helpers");
const { count } = require("../models/product-model");
const { response } = require("../app");

module.exports = {
  addTocart: async (req, res) => {
    if (req.session.email) {
      const email = req.session.email;
      const productId = req.params.id;

      const userDetails = await userHelper.findUser(email);

      if (userDetails) {
        const productDetails = await productHelper.findOneProduct(productId);

        if (productDetails) {
          const state = await cartHelper.findingUser(email);
          if (state) {
            const proId = productDetails._id.toString();

            let flag = 1;

            if (state.product.length == 0) {
              flag = 0;
            }
            let i;
            for (i = 0; i < state.product.length; i++) {
              let iteratingId = state.product[i].productId.toString();

              if (iteratingId === proId) {
                flag = 1;
                break;
              }
              flag = 0;
            }
            if (flag === 1) {
              req.session.quantity = state.product[i].count;
              res.json({ status: false });
            } else {
              await cartHelper.updateProductDetails(email, productDetails);
              res.json({ status: true });
            }
          }
          const TotalCount = await cartHelper.getTotalCount(email);
        }
      }
    } else {
      res.redirect("/login");
    }
  },

  getCart: (req, res) => {
    cartHelper.GET_CART(req.session.email).then((result) => {
      const cart = JSON.parse(JSON.stringify(result));
      console.log("cart is : ", cart);
      let Total = 0;
      let cartId;
      for (let i = 0; i < cart.length; i++) {
        cartId = cart[i]._id;
        Total += cart[i].subTotal;
      }

      let discount = 0;
      if (req.session.coupon) {
        req.session.Total = Math.floor(
          Total - (Total * req.session.coupon) / 100
        );

        console.log(req.session.Total, "with coupon");
        discount = (Total * req.session.coupon) / 100;
        console.log("coupon sesssion true ", req.session.coupon);
      } else {
        req.session.Total = Total;

        console.log(req.session.Total, "without   coupon");

        console.log("ok okk my fault");
      }
      req.session.order = true;

      res.render("user/cart", {
        user: req.session.email,
        cart,
        Total,
        cartId,
        discount,
      });
    });
  },
  deleteCartproduct: (req, res) => {
    const userId = req.body.userID;
    const proId = req.body.proID;
    cartHelper.removeCartProduct(userId, proId).then((status) => {
      if (status) {
        res.json({ status: true });
        // res.redirect('/cart')
      }
    });
  },
  updateminusCount: async (req, res) => {
    const updatedPrice = req.body.price;
    const proId = req.params.id;
    const status = await cartHelper.updateNegative(req.session.email, proId);

    if (status) {
      await cartHelper.updatesubTotal(req.session.email, proId, updatedPrice);
      res.json({ status: true });
    } else {
    }
  },
  updateplusCount: async (req, res) => {
    const updatedPrice = req.body.price;
    const count = req.body.count;
    const proId = req.params.id;
    const product = await productHelper.findOneProductId(proId);
    if (count > product.stock) {
      res.json({ status: false });
    } else {
      const status = await cartHelper.updatePositive(req.session.email, proId);
      if (status) {
        await cartHelper.updatesubTotal(req.session.email, proId, updatedPrice);
        res.json({ status: true });
      }
    }
  },

  getProceedTocheckPage: async (req, res) => {
    const result = await userHelper.findUser(req.session.email);
    const addressList = JSON.parse(JSON.stringify(result.address));
    cartHelper.GET_CART(req.session.email).then((result) => {
      const cart = JSON.parse(JSON.stringify(result));
      const TotalAmount = req.session.Total;
      console.log("total amount is : ", TotalAmount);
      req.session.order = true;
      res.render("user/check-payment", {
        user: true,
        cart,
        TotalAmount,
        addressList,
      });
    });
  },
};
