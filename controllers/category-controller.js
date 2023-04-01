const categoryHelper = require("../helpers/category-helpers");
const ALERTS = require("../config/enums");

module.exports = {
  categoryDisplay: (req, res) => {
    let cat = req.params.id;
    categoryHelper.findCategoryUser(cat).then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      if (req.session.email) {
        res.render("user/sorted", { user: true, data });
      } else {
        res.render("user/sorted", { data });
      }
    });
  },

  get_Categories: (req, res) => {
    categoryHelper.findCategoryAdmin().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/categories", {
        admin: true,
        data,
        cat: req.session.catexist,
      });
      req.session.catexist = false;
    });
  },

  add_Category: async (req, res) => {
    const cat = req.body.category;
    const sub = req.body.subcategory;
    const status = await categoryHelper.checkCategory(cat,sub);

    if (status) {
      req.session.catexist = ALERTS.CAT_EXIST;
      res.redirect("/admin/categories");
    } else {
     await categoryHelper
        .saveCategory(req.body)
        .then(res.redirect("/admin/categories"));
    }
  },

  listCategory: (req, res) => {},
};
