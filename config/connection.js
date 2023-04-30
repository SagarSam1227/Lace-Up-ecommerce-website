const mongoose = require("mongoose");

const dbConnect = () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect("mongodb+srv://sagarsam606:9Yel38wclJhSwywo@laceup.u8oxc8p.mongodb.net/test", {
      useNewUrlParser: true,

      useUnifiedTopology: true,
    });
    console.log("database connected");
  } catch (error) {
    console.log("database error");
  }
};

module.exports = dbConnect;
