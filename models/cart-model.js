const { ObjectId } = require("mongodb");
var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const cartSchema = new Schema({
  userId: {
    type: String,
  },
  product: [
    {
      productId: {
        type: ObjectId,
        ref: "product",
      },
      count: {
        type: Number,
      },
      subTotal: {
        type: Number,
      },
    },
  ],
  slug:String
});

const cart = mongoose.model("cart", cartSchema);

module.exports = cart;
