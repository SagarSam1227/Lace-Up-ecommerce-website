const { ObjectId } = require("mongodb");
var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderSchema = new Schema({
  addressId:String,
  userId: String,
  Total: Number,
  Discount: Number,
  orderDate: String,
  paymentMethod:String,
  product: [
    {
        _id:ObjectId, 
        item: ObjectId,   
         quantity: Number,
        subTotal: Number,
        products: {
          _id: ObjectId,
          name: String,
          category:String,
          oldPrice: Number,
          newPrice: Number,
          Image: String
        }
    }
  ],
  status:String,
  DeliveredAt:false,
  createdAt:{type: Date, default: Date.now},
  slug:String,
  reason:false
});

const order = mongoose.model("order", orderSchema);

module.exports = order;
