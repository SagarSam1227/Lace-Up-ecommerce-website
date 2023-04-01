var session = require("express-session");
var express = require("express");
var productHelper = require("../helpers/product-helpers");
var userController = require("../controllers/user-controller");
const productController = require("../controllers/admin-controller");

module.exports = {
  userLogin: (req, res, next) => {
    if (req.session.email) res.redirect("/");
    else {
      next();
    }
  },

  sessionCreat: (req, res) => {
    req.session.email = req.body.email;
    if (req.session.email) {
      res.redirect("/");
    }
  },

  userLogout: (req, res, next) => {
    if (req.session.email) {
      next(); 
    } else {
      res.redirect("/");
    }
  },
  orderPlaced:(req,res,next)=>{
    if(req.session.order){
      next()
    }else{
      res.redirect('/')
    }
  },
  // orderFalse:(req,res,next)=>{
  //   if(req.session.order){
  //     res.redirect('/')
  //   }else{
  //     next()
  //   }
  // }
};
