const order = require("../models/order-model");
const Razorpay = require("razorpay");
const { json } = require("body-parser");
const crypto = require('crypto')

var instance = new Razorpay({
  key_id: "rzp_test_2Nt8hWDvPKHDDI",
  key_secret: "RFJTzBajBnQBkkFCHyjjk6NE",
});

module.exports = {
  postOrder: (email, product, TotalAmount, currentDate, AddressId) => {
    return new Promise(async (resolve, reject) => {
      const orderDetails = await order({
        addressId: AddressId,
        userId: email,
        Total: TotalAmount,
        orderDate: currentDate,
        product: product,
        status: "Pending",
      });
      orderDetails.save();
      resolve(orderDetails);
    });
  },
  GET_ORDER: (userId) => {
    return new Promise(async (resolve, reject) => {
      const orderDetails = await order.find({ userId: userId });
      resolve(orderDetails);
    });
  },
  getOrderAdmin: () => {
    return new Promise(async (resolve, reject) => {
      const orderDetails = await order.find();
      resolve(orderDetails);
    });
  },

  getOneOrder: (id) => {
    return new Promise(async (resolve, reject) => {
      const orderDetails = await order.findOne({ _id: id });
      resolve(orderDetails);
    });
  },
  CHANGE_STATUS: (id, status) => {
    return new Promise(async (resolve, reject) => {
      const state = await order.updateOne(
        { _id: id },
        {
          status: status,
        }
      );
      resolve(state);
    });
  },
  generateRazorpay: (orderId, Total) => {
    return new Promise(async(resolve, reject) => {
      var options = {
        amount: Total*100,
        currency: "INR",
        receipt: orderId.toString(),
      };
     instance.orders.create(options, function (err, order) {
        if (err) {
          console.log("err is ", err);
          reject(err)
        }
        console.log("new order ", order);

        resolve(order);
      });
    });
  },

  VERIFY_PAYMENT:(details)=>{
    return new Promise((resolve,reject)=>{
      let hmac = crypto.createHmac('sha256','RFJTzBajBnQBkkFCHyjjk6NE')
      hmac.update(details['payment[razorpay_order_id]']+'|'+details['payment[razorpay_payment_id]']);
      hmac=hmac.digest('hex')
    if(hmac==details['payment[razorpay_signature]']){
      resolve()
    }else{
      reject()
    }
     })
  },

  updatePayMethod:(id,paymentMethod)=>{
    return new Promise(async (resolve, reject) => {
      const state = await order.updateOne(
        { _id: id },
        {
          paymentMethod: paymentMethod,
        }
      );
      resolve(state);
    });
  },


  GET_ORDER_WALLET:(email,paymentMethod)=>{
    return new Promise(async(resolve,reject)=>{
      const orderDetails = await order.find({
        userId:email,
        paymentMethod:paymentMethod
      })
      resolve(orderDetails)
    })
  }
};
