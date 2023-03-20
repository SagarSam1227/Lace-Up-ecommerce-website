var mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categorySchema = new Schema({
  category: {
    type: String,
  },
  sub: {
    type: String,
  },
  products: {
    type: Array,
  },
  description: {
    type: String,
  },
});

const category = mongoose.model("Category", categorySchema);

module.exports = category;
