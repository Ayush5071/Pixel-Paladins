const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const session = require("express-session");
const passport = require('passport');
const Seller = require('./routes/seller'); // Require the seller model
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const app = express();
var Publishable_Key = 'Your_Publishable_Key'
var Secret_Key = 'Your_Secret_Key'
const admin = require('firebase-admin');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(session({
  resave: false,
  saveUninitialized: false,
  secret: "Ayush12@"
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const serviceAccount = require('./serviceAccountKey.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// app.js
// function sendPushNotification(token, title, body) {
//   const message = {
//     notification: {
//       title: title,
//       body: body,
//     },
//     token: token,
//   };

//   admin.messaging().send(message)
//     .then((response) => {
//       console.log('Notification sent successfully:', response);
//     })
//     .catch((error) => {
//       console.error('Error sending notification:', error);
//     });
// }

// Serializing and deserializing user
passport.serializeUser(usersRouter.serializeUser());
passport.deserializeUser(usersRouter.deserializeUser());

//Serializing and deserializing seller
passport.serializeUser(Seller.serializeUser());
passport.deserializeUser(Seller.deserializeUser());

// Routes setup
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/sellers', Seller); // Include seller routes

app.use(function(req, res, next) {
  next(createError(404));
});

// Error handler
app.use(function(err, req, res, next) {
  // Set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // Render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
