const Coupon = require('../models/coupon-model')


module.exports={
    POST_COUPON:(schemeObj,coupon,code)=>{

        return new Promise(async(resolve,Reject)=>{
      const couponDetails= await Coupon({
        scheme:schemeObj,
        discount:coupon.discount,
        validity:coupon.day,
        number:coupon.number,
        code:code
       }) 
       couponDetails.save()
       resolve(couponDetails)
         })
    },

    GET_COUPONS:()=>{
        return new Promise(async(resolve,reject)=>{
            const data = await Coupon.find()
            resolve(data)
        })
            
    }

}