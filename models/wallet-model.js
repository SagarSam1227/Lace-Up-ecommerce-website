var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const walletSchema = new Schema({
  userId: {
    type: String,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
  transactions: [
    {
      orderDate: String,
      orderId: String,
      status: String,
    },
  ],
  slug:String
});

const Wallet = mongoose.model("Wallet", walletSchema);

module.exports = Wallet;
