var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  category: {
    subCategory: {
      type: String,
    },
    type: String,
    required: true,
  },
  oldPrice: {
    type: Number,
    required: true,
  },
  newPrice: {
    type: Number,
    required: true,
  },
  Image: {
    type: String,
    required: true,
  },
  stock:{
    type: Number,
    required: true,
  },
  list:{
    type: Boolean,
    required: true
  }
});

const Product = mongoose.model("Product", productSchema);

module.exports = Product;
