
const category = require("../models/category-model");
const Category = require("../models/category-model");


module.exports = {
  saveCategory: (data) => {
    return new Promise(async (resolve, reject) => {
      let categoryDetails = new Category({
        category: data.category,
        sub: data.subcategory,
        description: data.description,
        list:true
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
      if(category==null){
        reject('Page not found !')
      }else{
        
        resolve(categoryFind);
      }
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
        category: category,list:true
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
},

CHANGE_LIST:(id,status)=>{
  return new Promise(async(resolve,reject)=>{
       await category.updateOne({
          _id:id
      },{
          list:status
      })
      resolve()
  })
}
}
