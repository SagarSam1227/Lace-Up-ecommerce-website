const { ObjectId } = require("mongodb");
var mongoose = require("mongoose");
const product = require('../models/product-model')

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId:{
    type:String
  },
  product: [
    {
      productId: {
        type: ObjectId,
        ref: "product",
      },
      count: {
        type: Number
      },
      subTotal: {
        type: Number
      }
    }
  ]
});

const cart = mongoose.model("cart", cartSchema);

module.exports = cart;
