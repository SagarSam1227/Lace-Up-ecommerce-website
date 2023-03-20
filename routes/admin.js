var express = require("express");
var session = require("express-session");
var router = express.Router();
const multer = require("multer");
var adminSession = require("../sessions/admin-session");
var adminController = require("../controllers/admin-controller");
const Product = require("../models/product-model");
var multerFile = require("../config/multer");
const categoryController = require("../controllers/category-controller");

router.get("/", adminSession.adminLogin, adminController.Admin_LoginPage);

router
  .route("/dashboard")
  .get(adminSession.adminCheck, adminController.display_Dashboard)
  .post(adminSession.sessionCreat);

router
  .route("/categories", adminSession.adminCheck)
  .get(categoryController.get_Categories)
  .post(categoryController.add_Category);

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
  "/delete-product/:id",
  adminSession.adminCheck,
  adminController.deleteProduct
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

router.get("/list-users", adminSession.adminCheck, adminController.usersList);

router.get("/subctegory-list", categoryController.listCategory);

router.get("/logout", adminSession.adminCheck, adminSession.sessionDestroy);

module.exports = router;  