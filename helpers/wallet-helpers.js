const wallet = require("../models/wallet-model");

module.exports = {
  CREATE_WALLET: (data) => {
    return new Promise(async (resolve, reject) => {
      const walletDetails = await wallet({
        userId: data.email,
        balance: 0.0,
      });
      walletDetails.save();
      resolve();
    });
  },
  GET_WALLET: (email) => {
    return new Promise(async (resolve, reject) => {
      const walletDetails = await wallet.findOne({
        userId: email,
      });
      resolve(walletDetails);
    });
  },

  UPDATE_WALLET: (email, amount) => {
    return new Promise(async (resolve, reject) => {
      const status = await wallet.updateOne(
        {
          userId: email,
        },
        {
          $inc:{
            balance:amount 
          }
        }
      );
      resolve(status)
    });
  },
};
