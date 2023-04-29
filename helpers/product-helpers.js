var db = require("../config/connection");
const { response } = require("express");
var Products = require("../models/product-model");

const User = require("../models/user-model");

module.exports = {
  AddProduct: (product, filename,slug) => {
    return new Promise(async (resolve, reject) => {
      let productDetails = new Products({
        name: product.name,
        category: product.category,
        newPrice: product.newPrice,
        Image: filename,
        stock: +product.stock,
        list: true,
        slug:slug
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

  findProduct: (skip) => {
    return new Promise(async (resolve, reject) => {
      let productFind = await Products.find().limit(8).skip(skip);
      console.log('okkk bybybbybybyb: ',productFind);
      resolve(productFind);
    });
  },



  findAllProduct: () => {
    return new Promise(async (resolve, reject) => {
      let productFind = await Products.find()
      resolve(productFind);
    });
  },


  findOfferProducts: () => {
    return new Promise(async (resolve, reject) => {
      let productFind = await Products.find({
        "offer":{$exists:true}
      })
      resolve(productFind);
    });
  },


  findProductHome: () => {
    return new Promise(async (resolve, reject) => {
      let productFind = await Products.find()
     
      resolve(productFind);
    });
  },
  addImage: () => {
    Products.updateOne(product).then((data) => {
      id(data._id);
    });
  },
  listUpdate: (slug, state) => {
    return new Promise(async (resolve, reject) => {
      const data = await Products.updateOne(
        { slug: slug },
        {
          list: state,
        }
      );
      resolve();
    });
  },
  productEdit: (slug, data, filename) => {
    return new Promise(async (resolve, reject) => {
     const productDetails = await Products.updateOne(
        { slug: slug },
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
        console.log(productDetails);
        if(productDetails==null){
          reject('Page not found !')
        }else{

          resolve(productDetails);
        }
    });
  },
  findOneProduct: (slug) => {
    return new Promise(async (resolve, reject) => {
      let productFind = await Products.findOne({ slug:slug });
      if(productFind==null){
        reject('product not found !')
      }else{

        resolve(productFind);
      }

    });
  },

  findOneProductId: (proId) => {
    return new Promise(async (resolve, reject) => {
      let productFind = await Products.findOne({ _id:proId });
      if(productFind==null){
        reject('product not found !')
      }else{

        resolve(productFind);
      }

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


  GET_COUNT:(cat)=>{
    return new Promise(async(resolve,reject)=>{
      const category = await Products.countDocuments({
        category:cat
      })
      resolve(category)
    })
  },


  DELETE_OFFER:(slug)=>{
    return new Promise(async(resolve,reject)=>{
      await Products.updateOne({
        slug:slug
      },{
        $unset:{offer:""}
      })
      resolve()
    })
  }





  

  
};
