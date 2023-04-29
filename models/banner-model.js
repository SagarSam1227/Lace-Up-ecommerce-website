const mongoose=require('mongoose')

const Schema=mongoose.Schema

const bannerSchema =  new Schema({
    title:String,
    description:String,
    Image:String,
    list:Boolean,
    slug:String
})

const banner = mongoose.model('banner',bannerSchema)

module.exports=banner;