const { json } = require('body-parser');
const bannerHelper = require('../helpers/banner-helper')

module.exports={
    getBanner:async(req,res)=>{
        await bannerHelper.GET_BANNER().then((result)=>{
            const data = JSON.parse(JSON.stringify(result))
            res.render('admin/banner',{admin:true,data})

        })
    },

    postBanner:async(req,res)=>{
        console.log(req.body);
        console.log(req.file.filename);
        await bannerHelper.POST_BANNER(req.body,req.file.filename).then(
            res.redirect('/admin/banner')
        )
    },

    falseList:async(req,res)=>{
        const id = req.params.id

        await bannerHelper.CHANGE_LIST(id,false).then(
            res.redirect('/admin/banner')
        )
    },
  
    trueList:async(req,res)=>{
        const id = req.params.id

        await bannerHelper.CHANGE_LIST(id,true).then(
            res.redirect('/admin/banner')
        )
    }
}