const cartHelper = require("../helpers/cart-helpers");
const userHelper = require("../helpers/user-helpers");
const productHelper = require("../helpers/product-helpers");

module.exports = {
  
  addTocart : async(req, res) => {
    if (req.session.email) {
      const email = req.session.email;
      const productId = req.params.id;
      console.log(email);
      console.log(productId);

      const userDetails = await userHelper.findUser(email)
      if(userDetails){
      const  productDetails= await productHelper.findOneProduct(productId)
      console.log(productDetails);
      if(productDetails){
        const state = await cartHelper.findingUser(email)
        console.log('state is ', state);
        if(state){
          console.log(true);
          await cartHelper.updateProductDetails(email,productDetails)
        }else{
          console.log(false);
          const status = await cartHelper.insertfirstProduct(email)
          if(status){
            await cartHelper.updateProductDetails(email,productDetails)
          }
        }
      }
    res.redirect("/")
    }else{
        
      }

      }else{
        res.redirect('/login')
    }

    },

    getCart: (req,res)=>{
      cartHelper.GET_CART(req.session.email).then((result)=>{
        const cart = JSON.parse(JSON.stringify(result));
        console.log(cart[0].userId);
        
      })
      res.render('user/cart',{user:true})
    }
  }
