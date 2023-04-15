var express = require("express");
var session = require("express-session");
var router = express.Router();
const multer = require("multer");
var adminSession = require("../sessions/admin-session");
var adminController = require("../controllers/admin-controller");
const Product = require("../models/product-model");
var multerFile = require("../config/multer");
const categoryController = require("../controllers/category-controller");
const orderController = require("../controllers/order-controller")
const couponController= require('../controllers/coupon-controller')

router.get("/", adminSession.adminLogin, adminController.Admin_LoginPage);

router
  .route("/dashboard")
  .get(adminSession.adminCheck, adminController.display_Dashboard)
  .post(adminController.checkAdmin,adminSession.sessionCreat);

router
  .route("/categories", adminSession.adminCheck)
  .get(categoryController.get_Categories)
  .post(categoryController.add_Category);

  router.post('/get-subcategory',categoryController.getsubCategory)

router
  .route("/edit-product/:id")
  .get(adminSession.adminCheck, adminController.editProduct)
  .post(
    multerFile.uploads,
    adminSession.adminCheck,
    adminController.updateProduct
  );

router
  .route("/add-product")
  .get(adminSession.adminCheck, adminController.get_addProduct)
  .post(
    multerFile.uploads,
    adminSession.adminCheck,
    adminController.add_Product
  );

router.get(
  "/list-products",
  adminSession.adminCheck,
  adminController.listProducts
);

router.get(
  "/list-false-product/:id",
  adminSession.adminCheck,
  adminController.listFalse
);

router.get("/list-true-product/:id",
adminSession.adminCheck,
adminController.listTrue
);

router.get(
  "/user-block/:id",
  adminController.userBlock,
  adminController.userRedirect
);

router.get(
  "/user-unblock/:id",
  adminController.userUnblock,
  adminController.userRedirect
);

router.get("/offers",adminSession.adminCheck,adminController.getOffers)
router.post('/offers',adminController.setOffers)

router.post('/offers-product',adminController.setOffersProduct)

router.get('/coupons',adminSession.adminCheck,couponController.getCoupons)
router.post('/coupons',couponController.postCoupon)


router.get("/list-users", adminSession.adminCheck, adminController.usersList);

router.get("/subctegory-list", categoryController.listCategory);

router.get('/list-orders',adminSession.adminCheck,orderController.orderList)

router.get("/order-details-admin/:id",adminSession.adminCheck,orderController.orderView)

router.get("/logout", adminSession.adminCheck, adminSession.sessionDestroy);

router.post('/change-status',orderController.changeStatus)

module.exports = router;
