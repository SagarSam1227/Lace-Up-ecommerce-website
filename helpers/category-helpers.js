const Category = require("../models/category-model");
const Product = require("../models/product-model");

module.exports = {
  saveCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      let categoryDetails = new Category({
        category: data.category,
        sub: data.subcategory,
        description: data.description,
      });
      categoryDetails.save();
      resolve(categoryDetails);
    });
  },

  findCategoryUser: (cat) => {
    return new Promise(async (resolve, reject) => {
      let categoryFind = await Product.find({ category: cat });
      resolve(categoryFind);
    });
  },
  findCategoryAdmin: () => {
    return new Promise(async (resolve, reject) => {
      let categoryFind = await Category.find();
      resolve(categoryFind);
    });
  },
  checkCategory: (cat, sub) => {
    return new Promise(async (resolve, reject) => {
      let status = await Category.find({
        $and: [{ sub: sub }, { category: cat }],
      });
      if (status.length == 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  },
};
