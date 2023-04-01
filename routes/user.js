const { response } = require("express");
var express = require("express");
var router = express.Router();
const userSession = require("../sessions/user-session");
const userController = require("../controllers/user-controller");
const categoryController = require("../controllers/category-controller");
const cartController = require("../controllers/cart-controller");
const orderController = require ("../controllers/order-controller")

router.get("/", userController.userHome);

router
  .route("/login")
  .get(userSession.userLogin, userController.login_Page)
  .post(userController.loginCheck, userSession.sessionCreat);

router
  .route("/signup")
  .get(userSession.userLogin, userController.signUp_Page)
  .post(userController.postSignup);

router
  .route("/otp-login", userSession.userLogin)
  .get(userController.display_OTP_loginPage)
  .post(userController.OTP_Login);

router
  .route("/otp-varification")
  .get(userSession.userLogin, userController.display_OTP_verificationPage)
  .post(userSession.userLogin, userController.OTP_verification);

router.get("/logout", userSession.userLogout, userController.sessionDestroy);

router.get("/product/:id", userController.each_Product_Details);

router.get("/category-collection/:id", categoryController.categoryDisplay);

// cart--------------

router.get("/cart", userSession.userLogout, cartController.getCart);

router.get("/cart/:id", cartController.addTocart);

router.post(
  "/delete-cart-Product",
  userSession.userLogout,
  cartController.deleteCartproduct
);
     
router.post("/minus-count/:id", cartController.updateminusCount);

router.post("/plus-count/:id", cartController.updateplusCount);

router.get(
  "/check-payment",
  userSession.userLogout,
  userSession.orderPlaced,
  cartController.getProceedTocheckPage
);

router.post("/newpayment-address", userController.addAddressInpayment);

// account-------------

router.get(
  "/user-account",
  userSession.userLogout,
  userController.getAccountPage 
);

router.post("/update-user", userSession.userLogout, userController.updateUser);

//address----------------

router.post("/add-address", userSession.userLogout, userController.addAddress);

router.get('/delete-address/:id',userSession.userLogout,userController.deleteAddress)

//Place order---------------

router.get('/get-orders',userSession.userLogout,orderController.getOrder)

router.post("/place-order",userSession.userLogout,userSession.orderPlaced,orderController.placeOrder);

router.get('/order-details/:id',userSession.userLogout,orderController.orderView)

router.get('/success',orderController.renderSuccess)

router.post('/verify-payment',orderController.verifyPayment)
 

module.exports = router;
