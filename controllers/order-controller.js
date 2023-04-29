const orderHelper = require("../helpers/order-helpers");
const cartHelper = require("../helpers/cart-helpers");
const userHelper = require("../helpers/user-helpers");
const productHelper = require("../helpers/product-helpers");
const { response } = require("../app");
const { Reject } = require("twilio/lib/twiml/VoiceResponse");
const couponHelpers = require("../helpers/coupon-helpers");
const walletHelper = require("../helpers/wallet-helpers");
const couponController = require("./coupon-controller");
const couponHelper = require("../helpers/coupon-helpers");
const slugify = require('../config/slugify')

module.exports = {
  placeOrder: async (req, res) => {
    const paymentMethod = req.body.payment_option;
    const AddressId = req.body.id;
    const result = await cartHelper.GET_CART(req.session.email);

    const productDetails = JSON.parse(JSON.stringify(result));

    const TotalAmount = req.session.Total;
    console.log("total amount: ", TotalAmount);

    const today = new Date();
    const date =
      today.getDate() +
      "-" +
      (today.getMonth() + 1) +
      "-" +
      today.getFullYear();
    // const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const currentDate = date;
    const slug = slugify.toSlug()
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

    req.session.coupon = false;

    //coupon

    const coupons = await couponHelper.GET_PERSON_COUPON("admin");
    console.log(coupons);
    let mainCoupon = null;
    let COUPON = false;
    for (let i = 0; i < coupons.length; i++) {
      if (coupons[i].scheme.type == "Amount") {
        console.log("total amount for coupon ", TotalAmount);
        const state = await couponHelper.CHECK_USERLIST(
          coupons[i].code,
          req.session.email
        );
        console.log("state is : ", state);
        if (state !== null) {
          console.log("coupon onnulla ", state);
        } else {
          console.log("else case of check user list worked !");
          const status = couponController.checkAmount(
            TotalAmount,
            coupons[i].scheme.amount
          );
          if (status) {
            COUPON = true;
            mainCoupon = coupons[i];
            break;
          }
        }
      }
    }

    console.log("coupon Id is : ", mainCoupon);
    if (COUPON) {
      couponController.addCouponUser(mainCoupon, req.session.email);
    }
    //-----

    if (status) {
      if (paymentMethod === "Cash on Delivery") {
        req.session.order = false;
        await orderHelper.updatePayMethod(status._id, paymentMethod);
        await orderHelper.CHANGE_STATUS(status._id, (state = "Placed"));

        res.json({ status: "COD", coupon: COUPON });
      } else if (paymentMethod === "Wallet") {
        const result = await walletHelper.GET_WALLET(req.session.email);
        if (result) {
          if (result.balance < TotalAmount) {
            res.json({ status: "EMPTY" });
          } else {
            await orderHelper.updatePayMethod(status._id, paymentMethod);
            await orderHelper.CHANGE_STATUS(status._id, (state = "Placed"));
            await walletHelper.UPDATE_WALLET(req.session.email, -TotalAmount);
            res.json({ status: "WALLET", coupon: COUPON });
          }
        }
      } else {
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
    let pageCount = +req.params.id
    const result = await orderHelper.GET_ORDER(req.session.email,pageCount*8).catch((error)=>{
      res.render('error',{ERROR:error})
    });
    const data = JSON.parse(JSON.stringify(result));
    res.render("user/orders", { user: true, data,pageCount});
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

    console.log('orderrrereer: ',order);
    if (req.path.match("admin")) {
      res.render("admin/view-order", { admin: true, product, Address, order });
    } else {
      res.render("user/view-order", { user: true, product, Address, order });
    }
  },
  orderList: async(req, res) => {

    let pageCount = +req.params.id
    await orderHelper.getOrderAdmin(pageCount*8).then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      if(data.length==0){
        pageCount = 0
      }
      res.render("admin/list-orders", { admin: true, data,pageCount });
    });
  },

  changeStatus: async (req, res) => {
    const status = req.body.status;
    const orderId = req.body.orderId;
    const reason = req.body.reason
    if (status === "Cancelled") {
      console.log(reason,'ssssssssss');
      await orderHelper.UPDATE_REASON(orderId,reason)
      const orderDetails = await orderHelper.getOneOrder(orderId);
      const TotalAmount = orderDetails.Total;
      if (orderDetails.status !== "Pending") {
        if (orderDetails.paymentMethod !== "Cash on Delivery") {
          await walletHelper.UPDATE_WALLET(req.session.email, TotalAmount);
        }
      }
    }
    let DeliveredAt=false
    if(status==='Delivered'){
      DeliveredAt = new Date()
    }
    await orderHelper
      .CHANGE_STATUS(orderId, status,DeliveredAt)
      .then(res.json({ status: true }));
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

  getSalesReport: async (req, res) => {
    console.log(req.body);
    if (req.path.match("filter")) {
      const from = new Date(req.body.fromDate);
      const to = new Date(req.body.toDate);
      const result = await orderHelper.GET_FILTER_ORDERLIST(from, to);
      const data = JSON.parse(JSON.stringify(result));
      console.log(data);
      res.json({data:data})
    } else {
      const result = await orderHelper.GET_ORDER_BY_STATUS("Delivered");
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/sales-report", { admin: true, data });
    }
  },


 
};      
