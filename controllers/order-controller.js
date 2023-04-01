const orderHelper = require("../helpers/order-helpers");
const cartHelper = require("../helpers/cart-helpers");
const userHelper = require("../helpers/user-helpers");
const productHelper = require("../helpers/product-helpers");
const { response } = require("../app");
const { Reject } = require("twilio/lib/twiml/VoiceResponse");

module.exports = {
  placeOrder: async (req, res) => {
    console.log(req.body);
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
      console.log("status is ", status);
      if (paymentMethod === "Cash on Delivery") {
        req.session.order = false;
        await orderHelper.updatePayMethod(status._id, paymentMethod);
        await orderHelper.CHANGE_STATUS(status._id, (state = "Processing"));
        res.json({ COD_SUCCESS: true });
      } else {
        console.log(status._id);
        console.log("total amount is ", TotalAmount);
        await orderHelper.updatePayMethod(status._id, paymentMethod);
        await orderHelper
          .generateRazorpay(status._id, TotalAmount)
          .then((response) => {
            console.log("response is ", response);
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
    console.log(order);

    //finding address
    const user = await userHelper.findAddress(order.userId, order.addressId);
    const USER = JSON.parse(JSON.stringify(user));
    console.log(USER[0].address);
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

    await orderHelper
      .CHANGE_STATUS(orderId, status)
      .then(res.json({ status: true }));
  },

  renderSuccess: (req, res) => {
    res.render("user/success", { user: true });
  },

  verifyPayment: async (req, res) => {
    const details = req.body;
    console.log(details);
    await orderHelper
      .VERIFY_PAYMENT(details)
      .then(() => {
        orderHelper
          .CHANGE_STATUS(details["order[receipt]"], (state = "Processing"))
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
