var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var hbs = require("express-handlebars");
var session = require("express-session");
var nocache = require("nocache");
var userRouter = require("./routes/user");
var adminRouter = require("./routes/admin");
var dbConnect = require("./config/connection");
var bodyParser = require("body-parser");
const Handlebars = require("handlebars");
var cors = require("cors");
const { handlebars } = require("hbs");
var slugify = require('slugify')

const dotenv = require("dotenv").config();
// require('dotenv').config({path:'../.env'});
// console.log('lllllllllll',process.env) 


var app = express();    

app.use(cors());
Handlebars.registerHelper("ifEquals", (str) => {
  if (str == "Delivered") {
    return "Return ?";
  }
  return "Cancel ?";
});

Handlebars.registerHelper("ifstatusDelivered", function (str, options) {
  return str === "Delivered" ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("ifChecking", function (str, options) {
  return str != "Returned" && str != "Cancelled"
    ? options.fn(this)
    : options.inverse(this);
});

Handlebars.registerHelper("ifCheckingDelivered", function (date, options) {
  const vlaidDate = new Date(date);

  const currDate = new Date();

  vlaidDate.setDate(vlaidDate.getDate() + 10);

  return vlaidDate > currDate ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper("offerCalculate", (offer, price) => {
  const newPrice = Math.floor(price - (price * offer) / 100);
  return newPrice;
});

Handlebars.registerHelper("payMethod", (method) => {
  if (method === "Cash on Delivery") {
    return "COD";
  } else if (method === "Wallet") {
    return "Wallet";
  } else {
    return "Online";
  }
});

Handlebars.registerHelper("checkScheme", function (scheme) {
  console.log(scheme);
  if (scheme.type == "Amount") {
    return "Buy more than " + scheme.amount + "/- to avial this coupon";
  }
  return "Buy any " + scheme.cat + " " + scheme.sub + " FootWear";
});

Handlebars.registerHelper("cancelorNot", (status) => {
  if (status === "Cancelled") {
    return "Credit";
  } else {
    return "Debit";
  }
});

Handlebars.registerHelper("findTotal", (sub, dis) => {
  return sub - dis;
});

Handlebars.registerHelper("Stringifying", (data) => {
  console.log("data is ", data);
  const result = JSON.stringify(data);
  return result;
});

Handlebars.registerHelper("plus", (data) => {
  return data + 1;
});

Handlebars.registerHelper("minus", (data) => {
  if (data == 0) return 0;
  return data - 1;
});

Handlebars.registerHelper("checkPagecount", (data) => {
  if (data == 0) return "none";
  return "all";
});

Handlebars.registerHelper("checkPagecountfull", (data) => {
  console.log(data.length);
  if (data.length < 8) return "none";
  return "all";
});

Handlebars.registerHelper("productCount", (data) => {
  console.log('dataaaa',data);
  console.log(data.length);
  return data.length;
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "hbs");
app.engine(
  "hbs",
  hbs.engine({
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: __dirname + "/views/layout/",
    partialsDir: __dirname + "/views/partials/",
  })
);

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "Key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 6000000 },
  })
);
app.use(nocache());
dbConnect();

// app.use('/twilio-sms',twilioRouter)
app.use("/", userRouter);
app.use("/admin", adminRouter);   

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
  res.render("error",{ERROR:'Page not Found !'});
});

// error handler
app.use(function (req, res, next, err) {
  // set locals, only providing error in development
  // res.locals.message = err.message;
  // res.locals.error = req.app.get("env") === "development" ? err : {};

  // // render the error page
  // res.status(err.status || 500);
  // res.render("error");
 
});

module.exports = app;
