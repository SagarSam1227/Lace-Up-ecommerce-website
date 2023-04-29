const order = require("../models/order-model");
const Razorpay = require("razorpay");
const { json } = require("body-parser");
const crypto = require("crypto");
const users = require("../models/user-model");
var Products = require("../models/product-model");
require("dotenv").config();

var instance = new Razorpay({    
  key_id:process.env.KEY_ID,
  key_secret:process.env.KEY_SECRET
  // process.env.KEY_SECRET,           
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
  GET_ORDER: (userId,skip) => {
    return new Promise(async (resolve, reject) => {
      const orderDetails = await order.find({ userId: userId }).sort({createdAt:-1}).limit(8).skip(skip);

      console.log(typeof(skip),skip);

     if(skip=='NaN'){
      reject('Page not found !')
     }
     else{

       resolve(orderDetails);
     }
     


    });
  },
  getOrderAdmin: (skip) => {
    return new Promise(async (resolve, reject) => {
      const orderDetails = await order.find().sort({createdAt:-1}).limit(8).skip(skip);

      resolve(orderDetails);
    });
  },

  getOneOrder: (id) => {
    return new Promise(async (resolve, reject) => {
      const orderDetails = await order.findOne({_id:id });  
      resolve(orderDetails);
    });
  },
  CHANGE_STATUS: (id, status,DeliveredAt) => {
    return new Promise(async (resolve, reject) => {
      const state = await order.updateOne(
        { _id: id },
        {
          status: status,
          DeliveredAt:DeliveredAt

        }
      );
      resolve(state);
    });
  },
  generateRazorpay: (orderId, Total) => {
    return new Promise(async (resolve, reject) => {
      var options = {
        amount: Total * 100,
        currency: "INR",
        receipt: orderId.toString(),
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log("err is ", err);
          reject(err);
        }
        console.log("new order ", order);

        resolve(order);
      });
    });
  },

  VERIFY_PAYMENT: (details) => {
    return new Promise((resolve, reject) => {
      let hmac = crypto.createHmac("sha256", "RFJTzBajBnQBkkFCHyjjk6NE");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  updatePayMethod: (id, paymentMethod) => {
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

  GET_ORDER_WALLET: (email, paymentMethod) => {
    return new Promise(async (resolve, reject) => {
      const orderDetails = await order.find({
        userId: email,
        paymentMethod: paymentMethod,
      });
      resolve(orderDetails);
    });
  },

  CATEGORY_CHART: () => {
    return new Promise(async (resolve, reject) => {
      const dashboardDetails = await order.aggregate([
        {
          $match: {
            status: "Delivered",
          },
        },

        {
          $unwind: "$product",
        },
        {
          $lookup: {
            from: "products",
            localField: "product.item",
            foreignField: "_id",
            as: "productDetails",
          },
        },
        {
          $unwind: "$productDetails",
        },
        {
          $group: {
            _id: "$productDetails.category",
            products: {
              $sum: 1,
            },
          },
        },
      ]);
      resolve(dashboardDetails);
    });
  },

  DASHBOARD_COUNT: () => {
    return new Promise(async (resolve, reject) => {
      const orderCount = await order.countDocuments();
      const productCount = await Products.countDocuments();
      const userCount = await users.countDocuments();
      const   anualRevenue = await order.aggregate([
        {
          $match: {
            status: "Delivered",
          },
        },
        {
          $group: {
            _id: null,
            revenue: { $sum: "$Total" },
          },
        }
      ]);

      const dashboardDetails = {
        orderCount: orderCount,
        productCount: productCount,
        userCount: userCount,
        anualRevenue: anualRevenue[0].revenue,
      };
    
      resolve(dashboardDetails);
    });
  },


  DASHBOARD_GRAPH:()=>{
    return new Promise(async(resolve,reject)=>{
      const dashboardDetails = await order.aggregate([
        {
          $match:{
            status:'Delivered'
          }
        },
        {
          $addFields: {
            orderDateObj: {
              $dateFromString: { dateString: '$orderDate', format: '%d-%m-%Y' }
            }
          }
        },
        {
          $group:{
            _id:{ $month: '$orderDateObj' },
            month: { $first: { $month: '$orderDateObj' } },
            year: { $first: { $year: '$orderDateObj' } },
            count:{$sum:1}
          }
        }
      ])
      resolve(dashboardDetails)
    })
  },



  GET_ORDER_BY_STATUS:(status)=>{
    return new Promise(async(resolve,reject)=>{
      const orderDetails = await order.find({
        status:status
      })
      resolve(orderDetails)
    })
  },



  GET_FILTER_ORDERLIST:(from,to,skip)=>{
    return new Promise(async(resolve,reject)=>{
      const orderDetails = await order.aggregate([
        {
          $match:{
            status:'Delivered'
          }
        },
        {
          $addFields: {
            orderDateISO: {
              $dateFromString: {
                dateString: "$orderDate",
                format: "%d-%m-%Y"
              }
            }
          }
        },
        {
          $match: {
            orderDateISO: {
              $gte:from,
              $lte:to
            }
          }
        }
      ])
      console.log(orderDetails);
      resolve(orderDetails)
    })
  },


  UPDATE_REASON:(id,reason)=>{
    return new Promise(async(resolve,reject)=>{
      await order.updateOne({
        _id:id
      },{reason:reason})
      resolve()
    })
    
  }
  
};
