const { json } = require("express");
const session = require("express-session");
const { response, render } = require("../app");
const productHelper = require("../helpers/product-helpers");
const userHelper = require("../helpers/user-helpers");
const userController = require("./user-controller");
const ALERTS = require("../config/enums");
const orderHelper = require("../helpers/order-helpers");
const categoryHelper = require("../helpers/category-helpers");
const bannerHelper = require("../helpers/banner-helper");
const slugify = require("../config/slugify");

module.exports = {
  checkAdmin: async (req, res, next) => {
    const admin = await userHelper.CHECK_ADMIN();
    if (
      admin[0].admin === req.body.username &&
      admin[0].password === req.body.password
    ) {
      next();
    } else {
      req.session.adminErr = ALERTS.ERR;
      res.redirect("/admin");
    }
  },

  Admin_LoginPage: (req, res) => {
    res.render("admin/admin-login", {
      admin: true,
      loginPage: true,
      adminErr: req.session.adminErr,
    });
    req.session.adminErr = false;
  },

  display_Dashboard: async (req, res) => {
    const catData = await orderHelper.CATEGORY_CHART();
    const counts = await orderHelper.DASHBOARD_COUNT();
    const monthlyGraph = await orderHelper.DASHBOARD_GRAPH();

    console.log("for graph: ", monthlyGraph);
    // count.productCount = details[0].productCount
    // count.userCount = details[0].userCount[0].userCount
    // count.orderCount = details[0].orderCount[0].orderCount

    const data = JSON.parse(JSON.stringify(catData));
    const result = JSON.parse(JSON.stringify(monthlyGraph));

    console.log("dashboard category details: ", catData);

    res.render("admin/admin-dashboard", {
      admin: true,
      counts,
      data,
      result,
    });
  },

  listProducts: (req, res) => {
    let pageCount = +req.params.id;
    console.log("page count is : ", pageCount);
    productHelper.findProduct(pageCount * 8).then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/list-product", { admin: true, data, pageCount });
    });
  },
  get_addProduct: (req, res) => {
    res.render("admin/add-product", {
      admin: true,
      proExist: req.session.proExist,
      vdoErr: req.session.vdoErr,
    });
    req.session.proExist = false;
    req.session.vdoErr = false;
  },

  add_Product: async (req, res) => {
    const proName = req.body.name;
    const proImage = req.file.filename;

    if (proImage.match("mp4")) {
      req.session.vdoErr = ALERTS.VDO_ERR;
      res.redirect("/admin/add-product");
    } else {
      const status = await productHelper.productExisting(proName, proImage);
      if (status) {
        req.session.proExist = ALERTS.PRO_EXIST;
        res.redirect("/admin/add-product");
      } else {
        const slug = slugify.toSlug(req.body.name, req.body.category);
        await productHelper
          .AddProduct(req.body, req.file.filename, slug)
          .then(async (id) => {
            -(await categoryHelper.AddProductToSub(
              req.body,
              id,
              req.file.filename
            ));

            res.redirect("/admin/add-product");
          });
      }
    }
  },

  listFalse: async (req, res) => {
    let prdctId = req.params.id;
    await productHelper
      .listUpdate(prdctId, false)
      .then(res.redirect("/admin/list-products/0"));
  },

  listTrue: async (req, res) => {
    let prdctId = req.params.id;
    await productHelper
      .listUpdate(prdctId, true)
      .then(res.redirect("/admin/list-products/0"));
  },

  displayProducts: async (req, res, Session) => {
    const bannerData = await bannerHelper.GET_BANNER();
    const banner = JSON.parse(JSON.stringify(bannerData));
    await productHelper.findProductHome().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      if (Session) {
        res.render("user/home", {
          user: req.session.email,
          data,
          banner,
          count: req.session.count,
        });
      } else {
        res.render("user/home", { data, banner });
      }
    });
  },

  usersList: (req, res) => {
    let pageCount = +req.params.id;
    userHelper.finding(pageCount * 8).then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      if (data.length == 0) {
        pageCount = 0;
      }
      console.log(data, data.length);

      res.render("admin/list-users", { admin: true, data, pageCount });
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
    res.redirect("/admin/list-users/0");
  },

  editProduct: (req, res) => {
    let id = req.params.id;
    productHelper
      .findOneProduct(id)
      .then((result) => {
        const data = JSON.parse(JSON.stringify(result));
        res.render("admin/update-products", { admin: true, data });
      })
      .catch((error) => {
        res.render("error", { ERROR: error });
      });
  },
  updateProduct: (req, res) => {
    let id = req.params.id;
    let data = req.body;
    if (req.file == undefined) {
      productHelper.productEdit(id, data).then((data) => {
        res.redirect("/admin/list-products/0");
      });
    } else {
      let filename = req.file.filename;
      productHelper
        .productEdit(id, data, filename)
        .then(res.redirect("/admin/list-products/0"));
    }
  },

  getOffers: async (req, res) => {
    const result = await productHelper.findOfferProducts();
    const OFFER = JSON.parse(JSON.stringify(result));
    console.log("sssssss", OFFER);
    await productHelper.findAllProduct().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/offers", { admin: true, data, OFFER });
    });
  },

  setOffers: async (req, res) => {
    console.log(req.body);
    const discount = +req.body.discount;
    await categoryHelper
      .subcategoryProducts(req.body.category, req.body.subcategory)
      .then((result) => {
        const data = JSON.parse(JSON.stringify(result.products));
        console.log(data, "dddddddddddd");
        const productsId = data.map((ele) => ele.id);
        productsId.forEach(async (ele) => {
          await productHelper.updateOffer(ele, discount);
        });
        res.redirect("/admin/offers");
      });
  },

  setOffersProduct: async (req, res) => {
    const discount = req.body.discount;
    const name = req.body.product;

    await productHelper
      .updateOfferProduct(name, discount)
      .then(res.redirect("/admin/offers"));
  },

  deleteOffer: async (req, res) => {
    const slug = req.params.id;
    // const product = await productHelper.findOneProduct(slug)
    console.log("delelellle", slug);

    await productHelper.DELETE_OFFER(slug).then(res.redirect("/admin/offers"));
  },
};
