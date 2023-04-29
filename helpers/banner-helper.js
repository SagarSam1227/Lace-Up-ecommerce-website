const Banner = require('../models/banner-model')

module.exports={
    POST_BANNER:(data,Image) => {
        return new Promise(async (resolve, Reject) => {
          const bannerDetails = await Banner({
            title:data.title,
            description:data.description,
            Image:Image,
            list:true
          });
          bannerDetails.save();
          resolve(bannerDetails);
        });
      },


      GET_BANNER:()=>{
        return new Promise(async(resolve,reject)=>{
            const bannerDetails = await Banner.find({})
            resolve(bannerDetails)
        })
        
      },

      CHANGE_LIST:(id,status)=>{
        return new Promise(async(resolve,reject)=>{
             await Banner.updateOne({
                _id:id
            },{
                list:status
            })
            resolve()
        })
      }


}