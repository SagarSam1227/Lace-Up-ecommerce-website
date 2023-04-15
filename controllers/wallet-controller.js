const walletHelper = require('../helpers/wallet-helpers')
const orderHelper = require('../helpers/order-helpers')
module.exports = {
    getWallet:async(req,res)=>{
        const orderDetails =await orderHelper.GET_ORDER_WALLET(req.session.email,'Wallet')
        const order = JSON.parse(JSON.stringify(orderDetails));
        await walletHelper.GET_WALLET(req.session.email).then((result)=>{
            const data = JSON.parse(JSON.stringify(result));
            res.render('user/wallet',{user:true,data,order})
        })
    }
}