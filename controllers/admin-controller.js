const { json } = require("express");
const session = require("express-session");
const { response, render } = require("../app");
var productHelper = require("../helpers/product-helpers");
const userHelper = require("../helpers/user-helpers");
const userController = require("./user-controller");

module.exports = {
  Admin_LoginPage: (req, res) => {
    res.render("admin/admin-login", { admin: true, loginPage: true });
  },
  display_Dashboard: (req, res) => {
    res.render("admin/admin-dashboard", { admin: true });
  },

  listProducts: (req, res) => {
    productHelper.findProduct().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/list-product", { admin: true, data });
    });
  },
  get_addProduct: (req, res) => {
    res.render("admin/add-product", { admin: true });
  },

  add_Product: (req, res) => {
    productHelper
      .AddProduct(req.body, req.file.filename)
      .then(res.redirect("/admin/add-product"));
  },

  deleteProduct: (req, res) => {
    let prdctId = req.params.id;
    productHelper
      .productDelete(prdctId)
      .then(res.redirect("/admin/list-products"));
  },

  displayProducts: (req, res, session) => {
    productHelper.findProduct().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      if (session) {
        res.render("user/home", { user: true, data });
      } else {
          res.render("user/home", { data });
        }
      })
  }, 

  usersList: (req, res) => {
    userHelper.finding().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/list-users", { admin: true, data });
    });
  },
  userBlock: (req, res, next) => {
    const userId = req.params.id;
    userHelper.updateFalse(userId);
    next();
  },
  userUnblock: (req, res, next) => {
    const userId = req.params.id;
    userHelper.updateTrue(userId);
    next();
  },

  userRedirect: (req, res) => {
    res.redirect("/admin/list-users");
  },

  editProduct: (req, res) => {
    let id = req.params.id;
    productHelper.findOneProduct(id).then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/update-products", { admin: true, data });
    });
  },
  updateProduct: (req, res) => {
    let id = req.params.id;
    let data = req.body;
    let filename = req.file.filename;
    productHelper
      .productEdit(id, data, filename)
      .then(res.redirect("/admin/list-products"));
  },

};
