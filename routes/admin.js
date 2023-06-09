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
const bannerController = require('../controllers/banner-controller')

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
  "/list-products/:id",
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

router.get('/delete-offer/:id',adminSession.adminCheck,adminController.deleteOffer)

router.post('/offers-product',adminController.setOffersProduct)

router.get('/coupons',adminSession.adminCheck,couponController.getCoupons)
router.post('/coupons',couponController.postCoupon)


router.get("/list-users/:id", adminSession.adminCheck, adminController.usersList);

router.get('/list-orders/:id',adminSession.adminCheck,orderController.orderList)

router.get("/order-details-admin/:id",adminSession.adminCheck,orderController.orderView)

router.get("/logout", adminSession.adminCheck, adminSession.sessionDestroy);

router.post('/change-status',orderController.changeStatus)

router.get('/get-salesreport',adminSession.adminCheck,orderController.getSalesReport)

router.post('/filter-salesreprort',adminSession.adminCheck,orderController.getSalesReport)

router.get('/banner',adminSession.adminCheck,bannerController.getBanner)

router.post('/banner',multerFile.uploads,adminSession.adminCheck,bannerController.postBanner)

router.get('/list-true-banner/:id',adminSession.adminCheck,bannerController.trueList)

router.get('/list-false-banner/:id',adminSession.adminCheck,bannerController.falseList)

router.get('/list-true-category/:id',adminSession.adminCheck,categoryController.trueList)

router.get('/list-false-category/:id',adminSession.adminCheck,categoryController.falseList)

module.exports = router;
 