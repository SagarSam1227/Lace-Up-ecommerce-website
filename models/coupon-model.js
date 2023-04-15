var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const couponSchema = new Schema({
  scheme: {
    type: Object,
    required: true,
  },
  discount: {
    type: String,
    required: true,
  },
  validity: {
    type: String,
    required: true,
  },
  number: {
    type: String,
    required: true,
  },
  code:{
    type:String,
    required:true
  },
  createdAt:{type: Date, default: Date.now}
});

const Coupon = mongoose.model("coupon", couponSchema);

module.exports = Coupon;
