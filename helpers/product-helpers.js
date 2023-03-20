var db = require("../config/connection");
const { response } = require("express");
var Products = require("../models/product-model");

const User = require("../models/user-model");

module.exports = {
  AddProduct: (product, filename) => {
    return new Promise(async (resolve, reject) => {
      let productDetails = new Products({
        name: product.name,
        category: product.category,
        newPrice: product.newPrice,
        oldPrice: product.oldPrice,
        rating: product.rating,
        Image: filename,
      });
      productDetails.save();
      resolve(productDetails);
    });
  },
  findProduct: () => {
    return new Promise(async (resolve, reject) => {
      let productFind = await Products.find();
      resolve(productFind);
    });
  },
  addImage: () => {
    Products.updateOne(product).then((data) => {
      id(data._id);
    });
  },
  productDelete: (id) => {
    return new Promise(async (resove, reject) => {
      await Products.deleteOne({ _id: id });
    });
  },
  productEdit: (id, data, filename) => {
    return new Promise(async (resolve, reject) => {
      await Products.updateOne(
        { _id: id },
        {
          name: data.name,
          category: data.category,
          newPrice: data.newPrice,
          oldPrice: data.oldPrice,
          rating: data.rating,
          Image: filename,
        }
      );
      resolve();
    });
  },
  findOneProduct: (id) => {
    return new Promise(async (resolve, reject) => {
      let productFind = await Products.findOne({ _id: id });
      resolve(productFind);
    });
  },

  findUser: (username) => {
    return new Promise(async (resolve, reject) => {
      let userFind = await User.findOne({ email: username });
      resolve(userFind);
    });
  },
};
