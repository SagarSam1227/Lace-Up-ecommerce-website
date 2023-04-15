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
        Image: filename,
        stock: +product.stock,
        list: true,
      });
      let ID;
      productDetails.save((err, doc) => {
        if (err) {
          console.log(err);
        } else {
          ID = doc._id;
          resolve(ID);
        }
      });
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
  listUpdate: (id, state) => {
    return new Promise(async (resolve, reject) => {
      const data = await Products.updateOne(
        { _id: id },
        {
          list: state,
        }
      );
      resolve();
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
          stock: data.stock,
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

  productExisting: (name, Image) => {
    return new Promise(async (resolve, reject) => {
      let status = await Products.find({
        $or: [{ name: name }, { Image: Image }],
      });
      if (status.length == 0) {
        resolve(false);
      } else {
        resolve(true);
      }
    });
  },

  stockUpdate: (id, count) => {
    return new Promise(async (resolve, reject) => {
      await Products.updateOne({ _id: id }, { $inc: { stock: -count } });
    });
  },

  updateOffer: (id, discount) => {
    return new Promise(async (resolve, reject) => {
      await Products.updateOne(
        {
          _id: id,
        },
        {
          offer: discount
        }
      );
      resolve()
    });
  },

  updateOfferProduct: (name, discount) => {
    return new Promise(async (resolve, reject) => {
      await Products.updateOne(
        {
          name: name,
        },
        {
          offer: discount
        }
      );
      resolve()
    });
  },
};
