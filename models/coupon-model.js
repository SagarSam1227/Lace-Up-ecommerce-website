var mongoose = require("mongoose");

var Schema = mongoose.Schema;

const couponSchema = new Schema({
  person: {
    type: String,
    required: true,
  },
  scheme: {
    type: Object,
  },
  discount: {
    type: String,
    required: true,
  },
  validity: {
    type: String,
  },
  number: {
    type: String,
  },
  code: {
    type: String,
    required: true,
  },
  userlist: [],
  createdAt: { type: Date, default: Date.now },
  slug:String
});

const Coupon = mongoose.model("coupon", couponSchema);

module.exports = Coupon;
