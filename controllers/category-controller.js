const categoryHelper = require('../helpers/category-helpers')


module.exports={
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
          res.render("admin/categories", { admin: true, data });
        });
      },

    add_Category: (req, res) => {
        categoryHelper
          .saveCategory(req.body)
          .then(res.redirect("/admin/categories")); 
      },

      listCategory: (req, res) => {
        console.log("men");
      },
}