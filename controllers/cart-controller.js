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
             res.json({status:false});
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
      console.log(cart);
      let Total = 0;
      for (let i = 0; i < cart.length; i++) {
        Total += cart[i].subTotal;
      }
      req.session.Total = Total;
      req.session.order= true;

      res.render("user/cart", { user: req.session.email, cart, Total });

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
    console.log('body of ',req.body);
    const updatedPrice = req.body.price;
    const count= req.body.count
    const proId = req.params.id;
    const product = await productHelper.findOneProduct(proId)
    if(count>product.stock){
      console.log('errrrrrrrrr');
      res.json({status:false});
    }else{

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
      req.session.order=true
      res.render("user/check-payment", {
        user: true,
        cart,
        TotalAmount,
        addressList,
      });
    });
  },
};
