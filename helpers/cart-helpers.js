const cart = require("../models/cart-model");
const { findOne } = require("../models/product-model");
const ObjectId = require("mongodb").ObjectId;
const product = require("../models/product-model");

module.exports = {
  findingUser: (id) => {
    return new Promise(async (resolve, reject) => {
      const state = await cart.findOne({ userId: id });
      resolve(state);
    });
  },

  CREATE_CART: (data) => {
    return new Promise(async (resolve, reject) => {
      const cartDetails = new cart({
        userId: data.email,
      });
      cartDetails.save();
      resolve(cartDetails);
    });
  },

  updateProductDetails: (userID, productDetails) => {
    const productObj = {
      productId: productDetails._id,
      count: 1,
      subTotal: productDetails.newPrice,
    };
    return new Promise(async (resolve, reject) => {
      const status = await cart.updateOne(
        { userId: userID },
        { $push: { product: productObj } }
      );
      resolve(status);
    });
  },

  GET_CART: (email) => {
    return new Promise(async (resolve, reject) => {
      const cartDetails = await cart.aggregate([
        {
          $match: { userId: email },
        },
        {
          $unwind: "$product",
        },
        {
          $project: {
            item: "$product.productId",
            quantity: "$product.count",
            subTotal: "$product.subTotal"
            
          },
        },
        {
          $lookup: {
            from: "products",
            localField: "item",
            foreignField: "_id",
            as: "products",
          },
        },
        {
          $project: {
            item: 1,
            subTotal: 1,
            quantity: 1,
            products: { $arrayElemAt: ["$products", 0] },
          },
        },
      ]);
      resolve(cartDetails);
    });
  },

  getTotalCount: (id) => {
    return new Promise(async (resolve, reject) => {
      const state = await cart.findOne({ userId: id });
      if (state) {
        resolve(state.product.length);
      } else {
        resolve(0);
      }
    });
  },

  removeCartProduct: (userId, proId) => {

    return new Promise(async (resolve, reject) => {
      const status = await cart.updateOne(
        { _id: ObjectId(userId) },
        { $pull: { product: { productId: ObjectId(proId) } } }
      );
      resolve(true);
    });
  },

  updatePositive: (email, proId) => {
    return new Promise(async (resolve, reject) => {
      const status = await cart.updateOne(
        { userId: email, "product.productId": ObjectId(proId) },
        { $inc: { "product.$.count": 1 } }
      );
      resolve(status);
    });
  },

  updateNegative: (email, proId) => {
    return new Promise(async (resolve, reject) => {
      const status = await cart.updateOne(
        { userId: email, "product.productId": ObjectId(proId) },
        { $inc: { "product.$.count": -1 } }
      );
      resolve(status);
    });
  },

  updatesubTotal: (email, proId, updatedSubTotal) => {
    return new Promise(async (resolve, reject) => {
      const status = await cart.updateOne(
        { userId: email, "product.productId": ObjectId(proId) },
        { $set: { "product.$.subTotal": updatedSubTotal } }
      );
      resolve(status);
    });
  },
  removeCart:(email)=>{
    return new Promise(async(resolve,reject)=>{
        const status = await cart.updateOne(
          { userId:email},{

            $set:{product:[]}
          }
        );
        resolve(true);
      });
  }
};

// function Cart(user,product){
//   return new Promise(async(resolve, reject) =>{
//       await cart.updateOne({name})
//   })
// }
