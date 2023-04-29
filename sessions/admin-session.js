var session = require("express-session");
var express = require("express");
const adminController = require("../controllers/admin-controller");

module.exports = {
  adminLogin: (req, res, next) => {
    if (req.session.admin) {
      res.redirect("/admin/dashboard");
    } else {
      next();
    }
  },

  sessionCreat: (req, res) => {
    req.session.admin = req.body.username;
    res.redirect("/admin/dashboard");
  },

   adminCheck: (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.redirect("/admin");
    }
  },
  sessionDestroy: (req, res) => {
    req.session.admin = null;
    res.redirect("/admin");
  },
};
