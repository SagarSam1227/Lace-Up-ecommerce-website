
const Category = require("../models/category-model");


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

  findsubCategory: (cat,sub) => {
    return new Promise(async (resolve, reject) => {
      let categoryFind = await Category.find({
        $and: [{ sub: sub }, { category: cat }],
      });
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

  GET_SUBCATEGORY: (category) => {
    return new Promise(async (resolve, reject) => {
      const subcategoryList = await Category.find({
        category: category,
      });
      resolve(subcategoryList);
    });
  },

  AddProductToSub: (body,id, Image) => {
    const productObj = {
      name: body.name,
      price: body.newPrice,
      Image: Image,
      id:id
    };
    const cat = body.category;
    const sub = body.subcategory;

    return new Promise(async (resolve, reject) => {
      await Category.updateOne({
         $and: [{ sub: sub }, { category: cat }]},
         {
          $push:{products:productObj}
         }
         );
         resolve()
    });
  },
  
  subcategoryProducts:(cat, sub) => {
    return new Promise(async (resolve, reject) => {
      let details = await Category.findOne({
        $and: [{ sub: sub }, { category: cat }],
      });
      resolve(details)
    })
}
}
