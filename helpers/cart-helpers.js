const cart = require('../models/cart-model')
// const ObjectId = require("mongodb").ObjectId;
const product=require('../models/product-model')


module.exports={

      findingUser:(id)=>{
  return new Promise (async(resolve, reject)=>{
    const state = await cart.findOne({userId:id})
         resolve(state)
  })

},

  insertfirstProduct:(data)=>{
    return new Promise(async (resolve, reject) => {
      const cartDetails = new cart({
        userId:data.email
      });
      cartDetails.save()
        resolve(cartDetails);

      })
  },

  updateProductDetails:(userID,productDetails)=>{
            const productObj={
              productId:productDetails._id,
              count:1,
              subTotal:productDetails.newPrice
            }
            return new Promise(async(resolve,reject)=>{
                const status = await cart.updateOne({"userId":userID},{$push: {"product":productObj}})
                console.log('status is  ',status);
                resolve(status)
            })
  },

  GET_CART:(email)=>{
    return new Promise(async(resolve,reject)=>{
       cart.findOne({userId:email}).populate('product.productId').exec(function(err, cart) {
        console.log(cart); // logs the name of the author
      });

      // console.log(cartDetails);
      // resolve(cartDetails)
    })
  }
}

// function Cart(user,product){
//   return new Promise(async(resolve, reject) =>{
//       await cart.updateOne({name})
//   })
// }