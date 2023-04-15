const { json } = require("express");
const session = require("express-session");
const { response, render } = require("../app");
const productHelper = require("../helpers/product-helpers");
const userHelper = require("../helpers/user-helpers");
const userController = require("./user-controller");
const ALERTS = require("../config/enums");
const orderHelper = require("../helpers/order-helpers");
const categoryHelper = require("../helpers/category-helpers");

module.exports = {


  checkAdmin:async(req,res,next)=>{
   
   const admin= await userHelper.CHECK_ADMIN()
   if(admin[0].admin===req.body.username && admin[0].password===req.body.password){
    next()
   }else{
    req.session.adminErr=ALERTS.ERR
    res.redirect('/admin')
   }
  },


  Admin_LoginPage: (req, res) => {
    res.render("admin/admin-login", { admin: true, loginPage: true,adminErr:req.session.adminErr });
    req.session.adminErr=false
  },
  display_Dashboard: (req, res) => {
    res.render("admin/admin-dashboard", { admin: true});
   
  },

  listProducts: (req, res) => {
    productHelper.findProduct().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/list-product", { admin: true, data });
    });
  },
  get_addProduct: (req, res) => {
    res.render("admin/add-product", { admin: true,proExist:req.session.proExist,vdoErr:req.session.vdoErr}); 
    req.session.proExist=false
    req.session.vdoErr=false
  },

  add_Product: async(req, res) => {
    const proName = req.body.name
    const proImage = req.file.filename
   
    if(proImage.match('mp4')){
      req.session.vdoErr=ALERTS.VDO_ERR
      res.redirect("/admin/add-product")
    }else{

     
      const status = await productHelper.productExisting(proName,proImage)
      if(status){
        req.session.proExist=ALERTS.PRO_EXIST
        res.redirect("/admin/add-product")
      }else{
        await productHelper
        .AddProduct(req.body, req.file.filename)
        .then(async(id)=>{
       
          await categoryHelper.AddProductToSub(req.body,id,req.file.filename)
          
          res.redirect("/admin/add-product");
        })
          
      }
    }
  },

  listFalse: async (req, res) => {
 
    let prdctId = req.params.id;
    await productHelper
      .listUpdate(prdctId,false)
      .then(
        res.redirect("/admin/list-products")
      )
  },

  listTrue:async(req,res)=>{
    let prdctId = req.params.id;
    await productHelper
      .listUpdate(prdctId,true)
      .then(
        res.redirect("/admin/list-products")
      )
  },

  displayProducts: async(req, res, Session) => {
  await productHelper.findProduct().then((result) => {

      const data = JSON.parse(JSON.stringify(result));
      if (Session) {
        res.render("user/home", {
          user: req.session.email,
          data,
          count: req.session.count,
        });
      } else {
        res.render("user/home", { data });
      }
    }); 
  },
 
  usersList: (req, res) => {
    userHelper.finding().then((result) => {
      const data = JSON.parse(JSON.stringify(result));
    
      res.render("admin/list-users", { admin: true, data });
    });
  },
  userBlock: (req, res, next) => {
    const userId = req.params.id;
    userHelper.updateFalse(userId);
    next();
  },
  userUnblock: (req, res, next) => {
    const userId = req.params.id;
    userHelper.updateTrue(userId);
    next();
  },

  userRedirect: (req, res) => {
    res.redirect("/admin/list-users");
  },

  editProduct: (req, res) => {
    let id = req.params.id;
    productHelper.findOneProduct(id).then((result) => {
      const data = JSON.parse(JSON.stringify(result));
      res.render("admin/update-products", { admin: true, data });
    });
  },
  updateProduct:(req, res) => {
    let id = req.params.id;
    let data = req.body;
    if(req.file==undefined){
      productHelper
        .productEdit(id, data)
        .then(res.redirect("/admin/list-products"));
    }else{
      let filename = req.file.filename;
      productHelper
        .productEdit(id, data, filename)
        .then(res.redirect("/admin/list-products"));
    }
  },


  getOffers:async(req,res)=>{
    await productHelper.findProduct().then((result)=>{
      const data = JSON.parse(JSON.stringify(result))
      res.render('admin/offers',{admin:true,data})

    })
  },


  setOffers:async(req,res)=>{
    
    const discount = req.body.discount
    await categoryHelper.subcategoryProducts(req.body.category,req.body.subcategory).then((result)=>{
      const data = JSON.parse(JSON.stringify(result.products));
      const productsId= data.map(ele=>ele.id)


      productsId.forEach(async ele => {
        await productHelper.updateOffer(ele,discount).then(
          res.redirect('/admin/offers')
        )
      });
    })
  },

  setOffersProduct:async(req,res)=>{
   
    const discount = req.body.discount
    const name = req.body.product


    await productHelper.updateOfferProduct(name,discount).then(
      res.redirect('/admin/offers')
    )
  }

};
