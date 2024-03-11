const express = require('express');
const passport = require('passport');
const router = express.Router();
const userModel = require("./users");
const localStrategy = require("passport-local")
const sellerModel = require("./seller");
const upload = require('./multer');
const productModel = require('./product')

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

// Route for seller profile page
router.get('/sprofile', async function(req, res) {
    try {
        // Retrieve the seller details from the database based on the username stored in the session
        const username = req.session.username;
        
        if (!username) {
            // If username not found in session, redirect to login page
            return res.redirect('/slogin');
        }

        const seller = await sellerModel.findOne({ username: username });

        if (!seller) {
            // If seller not found, handle the case appropriately (e.g., redirect to login page)
            return res.redirect('/slogin');
        }

        // Render the seller profile page and pass the seller details to the template
        res.render('seller-profile', { seller: seller });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
        res.redirect('/slogin'); // Redirect to login page or handle appropriately
    }
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

router.get("/home",(req,res)=>{
    res.render('home')
})
router.get("/product",(req,res)=>{
    res.render('products');
})
router.get("/addproduct", async (req, res) => {
    const username = req.query.username;
    console.log(username)
    if (!username) {
        // Handle the case where username is not provided
        return res.redirect("/sprofile"); // Redirect to sprofile or handle appropriately
    }
    const seller = await sellerModel.findOne({ username: username });
    if (!seller) {
        // Handle the case where seller is not found
        return res.redirect("/sprofile"); // Redirect to sprofile or handle appropriately
    }
    console.log(seller)
    // Render the add-product page and pass the seller data
    res.render('add-product', { seller: seller });
});
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

router.post('/slogin', function(req, res, next) {
    passport.authenticate('seller-local', function(err, user, info) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return res.redirect('/slogin');
        }
        req.login(user, function(err) {
            if (err) {
                return next(err);
            }
            req.session.username = user.username; // Set the username in the session
            return res.redirect('/sprofile');
        });
    })(req, res, next);
});


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
  router.post('/setproduct', upload.single('productImage'), async (req, res) => {
    // Check if username exists in the session
    if (!req.session.username) {
        // Handle the case where username is not available in the session
        return res.redirect('/sprofile'); // Redirect to sprofile or handle appropriately
    }

    try {
        const username = req.session.username;
        // Find the seller document using the username
        const seller = await sellerModel.findOne({ username: username });
        console.log(seller)

        // If seller not found, handle the case appropriately
        if (!seller) {
            // Handle the case where seller is not found
            return res.redirect('/sprofile'); // Redirect to sprofile or handle appropriately
        }

        // Create a new product using the seller's ID and the form data
        const product = await productModel.create({
            seller: seller._id,
            price: req.body.price,
            title: req.body.title,
            brand: req.body.brand,
            productImage: req.file.filename
        });

        // Push the product's ID to the seller's products array
        seller.products.push(product._id);

        // Save the changes to the seller document
        await seller.save();
        console.log(product)

        // Redirect to sprofile after successfully adding the product
        res.redirect('/sprofile');
    } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
        res.redirect('/sprofile'); // Redirect to sprofile or handle appropriately
    }
});

module.exports = router;
// router.post('/fileupload',isLoggedIn,upload.single("image"),async (req,res,next)=>{
//     const user = await userModel.findOne({username: req.session.passport.user}); //jab bhi aap logged in honge req.session.passport.user => username
//     user.profileImage = req.file.filename; //jo bhi file upload hui hai wo iske andar save hota hai hamesha
//     await user.save(); //kyuki hamne haath se changes kiye hai isliye hme save krna hoga
//     res.redirect('/profile');
  
//   })