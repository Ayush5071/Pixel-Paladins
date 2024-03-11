const express = require('express');
const passport = require('passport');
const router = express.Router();
const userModel = require("./users");
const localStrategy = require("passport-local")
const sellerModel = require("./seller");
const upload = require('./multer');

// Passport local strategy for users
passport.use(new localStrategy(userModel.authenticate()));
passport.use('seller-local', new localStrategy(sellerModel.authenticate()));

// Passport local strategy for sellers
// passport.use('seller-local', new localStrategy({
//     usernameField: 'email',
//     passwordField: 'password',
//   }, (email, password, done) => {
//     sellerModel.findOne({ email: email }, (err, seller) => {
//       if (err) { return done(err); }
//       if (!seller) { return done(null, false, { message: 'Incorrect email.' }); }
//       if (seller.password !== password) { return done(null, false, { message: 'Incorrect password.' }); }
//       return done(null, seller);
//     });
//   }));

// Routes for user authentication
router.get('/',function(req,res){
    res.render('index');
});

router.get('/sprofile',async function(req,res){
    var username = req.session.username
    const seller = await sellerModel.findOne({username:username})
    console.log(seller)
    res.render('seller-profile',{seller});
});

// router.post("/seller-profile-image",upload.single("profileimage"),async (req,res)=>{
//     var username = req.session.username;
//     console.log(username)
//     const seller = await sellerModel.findOne({username:username})
//     console.log(seller)
//     seller.profileimage = req.file.filename;
//     await seller.save();
//     res.redirect("/sprofile")
// })

router.get('/profile',isLoggedIn,async function(req,res){
    let user = await userModel.findOne({username: req.session.passport.user});
    console.log(user);
    res.render('profile',{user});
});

router.get('/blogin',function(req,res){
    res.render('blogin');
});

router.get('/bsignup',function(req,res){
    res.render('bsignup');
});

router.post('/register',function(req,res){
    var userdata = new userModel({
        username: req.body.username,
        number: req.body.number,
        email: req.body.email,
        name: req.body.name
    });
    userModel.register(userdata, req.body.password)
    .then(function(registereduser){
    passport.authenticate("local")(req,res,function(){
        res.redirect('/profile');
    });
});

});

router.post('/login',passport.authenticate("local",{
    successRedirect: "/profile",
    failureRedirect: "/"
}),function(req,res){
    
});

router.get("/logout",function(req,res,next){
    req.logout(function(err){
        if(err) return next(err);
        res.redirect("/");
    });
});

// Routes for seller authentication
router.get('/slogin', (req, res) => {
    res.render('slogin');
});

router.post('/slogin', passport.authenticate('seller-local', {
    successRedirect: '/sprofile',
    failureRedirect: '/slogin',
}));

router.get('/ssignup', (req, res) => {
    res.render('ssignup');
});

router.post('/sregister',function(req,res){
    var sellerdata = new sellerModel({
        username: req.body.username,
        email: req.body.email,
        name: req.body.name,
        brandname:req.body.brandname
    });
    sellerModel.register(sellerdata, req.body.password)
    .then(function(registeredseller){
    passport.authenticate("seller-local")(req,res,function(){
        req.session.username = req.body.username
        res.redirect('/sprofile');
    });
}); 

});


router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    }
    res.redirect('/');
}
router.post("/seller-profile-image",upload.single("profileimage"),async (req,res)=>{
    var username = req.session.username;
    console.log(username)
    const seller = await sellerModel.findOne({username:username})
    console.log(seller)
    seller.profileimage = req.file.filename;
    await seller.save();
    res.redirect("/sprofile")
})
router.post('/buyer-p-image-upload',isLoggedIn,upload.single("image"),async (req,res,next)=>{
    const user = await userModel.findOne({username: req.session.passport.user}); //jab bhi aap logged in honge req.session.passport.user => username
    user.profileImage = req.file.filename; //jo bhi file upload hui hai wo iske andar save hota hai hamesha
    await user.save(); //kyuki hamne haath se changes kiye hai isliye hme save krna hoga
    res.redirect('/profile');
  
  })
router.post('/seller-p-image-upload',upload.single("simage"),async (req,res,next)=>{
    let username = req.session.username
    const seller = await sellerModel.findOne({username: username}); //jab bhi aap logged in honge req.session.passport.user => username
    seller.profileImage = req.file.filename; //jo bhi file upload hui hai wo iske andar save hota hai hamesha
    await seller.save(); //kyuki hamne haath se changes kiye hai isliye hme save krna hoga
    req.session.username = username
    res.redirect('/sprofile');
  
  })
module.exports = router;
// router.post('/fileupload',isLoggedIn,upload.single("image"),async (req,res,next)=>{
//     const user = await userModel.findOne({username: req.session.passport.user}); //jab bhi aap logged in honge req.session.passport.user => username
//     user.profileImage = req.file.filename; //jo bhi file upload hui hai wo iske andar save hota hai hamesha
//     await user.save(); //kyuki hamne haath se changes kiye hai isliye hme save krna hoga
//     res.redirect('/profile');
  
//   })