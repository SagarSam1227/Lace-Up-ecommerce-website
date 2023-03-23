const cartHelper = require("../helpers/cart-helpers");
const userHelper = require("../helpers/user-helpers");
const productHelper = require("../helpers/product-helpers");
const { count } = require("../models/product-model");

module.exports = {
  addTocart: async (req, res) => {
    if (req.session.email) {
      const email = req.session.email;
      const productId = req.params.id;
      console.log(email);
      console.log("id is ", productId);

      const userDetails = await userHelper.findUser(email);

      if (userDetails) {
        const productDetails = await productHelper.findOneProduct(productId);

        console.log(productDetails);

        if (productDetails) {
          const state = await cartHelper.findingUser(email);
          console.log("stateeeee ", state);
          if (state) {
            console.log("entered");
            const proId = productDetails._id.toString();
            console.log(proId);
            let flag = 1;
            console.log(state.product);
            if (state.product.length == 0) {
              flag = 0;
            }
            let i;
            for (i = 0; i < state.product.length; i++) {
              let iteratingId = state.product[i].productId.toString();

              console.log(iteratingId);

              console.log("product details is ", proId);

              if (iteratingId === proId) {
                flag = 1;
                break;
              }
              flag = 0;
            }
            if (flag === 1) {
              req.session.quantity = state.product[i].count;
              console.log("okk biriyanni", proId);
            } else {
              console.log("need to update");
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
      let Total =0
      console.log('cart is ----',cart);
      for(let i=0; i<cart.length;i++){
        Total += Total + cart[i].subTotal
      }
      console.log('total is----',Total);
      req.session.Total=Total

      res.render("user/cart", { user:req.session.email, cart,Total });

      // console.log(cart.product.length);
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
    console.log('bodyyy',req.body)
    const updatedPrice = req.body.price
    const proId = req.params.id;
    const status = await cartHelper
      .updateNegative(req.session.email, proId)

      if(status){
       await cartHelper.updatesubTotal(req.session.email, proId,updatedPrice)
        res.json({ status: true });
      }else{
        console.log('not decreased');
      }
  },
  updateplusCount: async (req, res) => {
   console.log('bodyyy',req.body)
   const updatedPrice = req.body.price
    const proId = req.params.id;
    const status = await cartHelper
      .updatePositive(req.session.email, proId)
      if(status){
        await cartHelper.updatesubTotal(req.session.email, proId,updatedPrice)
         res.json({ status: true });
      }else{
        console.log('not increased');
      }
  },
};
