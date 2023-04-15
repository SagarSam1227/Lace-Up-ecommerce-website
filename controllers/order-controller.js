const orderHelper = require("../helpers/order-helpers");
const cartHelper = require("../helpers/cart-helpers");
const userHelper = require("../helpers/user-helpers");
const productHelper = require("../helpers/product-helpers");
const { response } = require("../app");
const { Reject } = require("twilio/lib/twiml/VoiceResponse");
const couponHelpers = require("../helpers/coupon-helpers");
const walletHelper = require('../helpers/wallet-helpers')

module.exports = {
  placeOrder: async (req, res) => {
    const paymentMethod = req.body.payment_option;
    const AddressId = req.body.id;
    const result = await cartHelper.GET_CART(req.session.email);

    const productDetails = JSON.parse(JSON.stringify(result));

    const TotalAmount = req.session.Total;

    const today = new Date();
    const date =
      today.getDate() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getFullYear();
    // const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const currentDate = date;

    const status = await orderHelper.postOrder(
      req.session.email,
      productDetails,
      TotalAmount,
      currentDate,
      AddressId
    );
    for (let i = 0; i < productDetails.length; i++) {
      productHelper.stockUpdate(
        productDetails[i].item,
        productDetails[i].quantity
      );
    }

    await cartHelper.removeCart(req.session.email);

    if (status) {
      if (paymentMethod === "Cash on Delivery") {
        req.session.order = false;
        await orderHelper.updatePayMethod(status._id, paymentMethod);
        await orderHelper.CHANGE_STATUS(status._id, (state = "Placed"));
        res.json({ status: 'COD' });


      } else if(paymentMethod==='Wallet'){

       const result= await walletHelper.GET_WALLET(req.session.email)
        if(result){
          if(result.balance<TotalAmount){
            res.json({status:'EMPTY'})
          }else{
            
        await orderHelper.updatePayMethod(status._id, paymentMethod);
        await orderHelper.CHANGE_STATUS(status._id, (state = "Placed"));
        await walletHelper.UPDATE_WALLET(req.session.email,-TotalAmount)
            res.json({status:'WALLET'})
          }
        }

      }
      
      else{
        await orderHelper.updatePayMethod(status._id, paymentMethod);
        await orderHelper
          .generateRazorpay(status._id, TotalAmount)
          .then((response) => {
            
            res.json(response);
          })
          .catch((err) => console.log(err));
      }
    }
  },

  getOrder: async (req, res) => {
    const result = await orderHelper.GET_ORDER(req.session.email);
    const data = JSON.parse(JSON.stringify(result));
    res.render("user/orders", { user: true, data });
  },

  orderView: async (req, res) => {
    const id = req.params.id;
    const result = await orderHelper.getOneOrder(id);
    const order = JSON.parse(JSON.stringify(result));

    //finding address
    const user = await userHelper.findAddress(order.userId, order.addressId);
    const USER = JSON.parse(JSON.stringify(user));
  
    const Address = USER[0].address;
    //
    const product = JSON.parse(JSON.stringify(order.product));
    if (req.path.match("admin")) {
      res.render("admin/view-order", { admin: true, product, Address, order });
    } else {
      res.render("user/view-order", { user: true, product, Address, order });
    }
  },
  orderList: (req, res) => {
    orderHelper.getOrderAdmin().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/list-orders", { admin: true, data });
    });
  },

  changeStatus: async (req, res) => {
    const status = req.body.status;
    const orderId = req.body.orderId;
    if(status ==='Cancelled'){
      const orderDetails = await orderHelper.getOneOrder(orderId)
      const TotalAmount = orderDetails.Total
      if(orderDetails.status!=='Pending'){
        if(orderDetails.paymentMethod!=='Cash on Delivery'){

          await walletHelper.UPDATE_WALLET(req.session.email,TotalAmount)
        }
      }
    }
    await orderHelper
      .CHANGE_STATUS(orderId, status)
      .then(res.json({status:true}));
  },

  renderSuccess: (req, res) => {
    res.render("user/success", { user: true });
  },

  verifyPayment: async (req, res) => {
    const details = req.body;
    await orderHelper
      .VERIFY_PAYMENT(details)
      .then(() => {
        orderHelper
          .CHANGE_STATUS(details["order[receipt]"], (state = "Placed"))
          .then(() => {
            console.log("payment successfull");
            req.session.order = false;
            res.json({ status: true });
          });
      })
      .catch((err) => {
        console.log(err);
        res.json({ status: "Payment failed" });
      });
  },
};
