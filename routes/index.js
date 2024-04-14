const express = require('express');
const passport = require('passport');
const router = express.Router();
const userModel = require("./users");
const localStrategy = require("passport-local")
const sellerModel = require("./seller");
const upload = require('./multer');
const productModel = require('./product')
const reviewModel = require("./review")
const orderModel = require("./order")
const sendPushNotification = require('../app');
var stripe = require('stripe')('sk_test_51OvdslSHOgBCTCQbLwtAmCvS8havkRqnEVIlh5gWRLkjnXZxBbY13EVtHh3XRqeOdIp6cSBhoxxXL5gJORBoSsmq00Zgz9i15S');
// Passport local strategy for users
passport.use(new localStrategy(userModel.authenticate()));
//PASSPRORT LOCAL STRATEGY FOR SELLER 
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
//     }
//   }));

// Routes for user authentication
router.get('/',function(req,res){
    res.render('index');
});


// paymant routes ......
var Publishable_Key = 'pk_test_51OvdslSHOgBCTCQbl5vdNaMmn5d9Bof749HE2Qf4F1n3NIofGESlZZEc5YQAT7pvwWA3zMpXiOj8rZBPnbaXOhx800k7g0ELra'

router.get("/success",isLoggedIn,(req,res)=>{
    res.render("success");
})
// Backend route handlers
router.get('/payment/:id', async function(req, res){
    try {
        const productid = req.params.id;
        const product = await productModel.findOne({_id: productid});
        if (!product) {
            return res.status(404).send("Product not found");
        }
        res.render('payment', { key: Publishable_Key, product });
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

router.post('/payment/:id', isLoggedIn, async function(req, res){
    try {
        const user = await userModel.findOne({ username: req.session.passport.user });
        const productId = req.params.id;
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).send("Product not found");
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: product.price * 100,
            currency: 'INR',
            payment_method_types: ['card'],
            customer: user.stripeCustomerId,
            setup_future_usage: 'off_session',
            confirm: true,
            payment_method_data: {
                type: 'card',
                card: {
                    token: req.body.stripeToken
                }
            },
            description: product.title,
            shipping: {
                address: {
                    line1: req.body.address,
                    city: 'Indore',
                    postal_code: '452331',
                    state: 'Madhya Pradesh',
                    country: 'IN'
                },
                name: req.body.name,
                phone: req.body.phone
            },
            receipt_email: req.body.email,
        });

        res.redirect("/success");
    } catch (error) {
        res.status(500).send("Payment Error: " + error.message);
    }
});

//recommendation system
async function recommendProducts(userId) {
    try {
        const user = await userModel.findById(userId).populate({
            path: 'orders',
            populate: {
                path: 'product',
                model: 'Product' 
            }
        });
        if (!user) {
            throw new Error('User not found');
        }
        console.log(user)
        const productTypeCounts = {};
        user.orders.forEach(order => {
            const productType = order.product.type;
            console.log(productType)
            productTypeCounts[productType] = (productTypeCounts[productType] || 0) + 1;
        });

        const sortedProductTypes = Object.keys(productTypeCounts).sort((a, b) => productTypeCounts[b] - productTypeCounts[a]);
        const recommendedProducts = await productModel.find({ type: sortedProductTypes[0] }).limit(10);

        return recommendedProducts;
    } catch (err) {
        console.error(err);
        throw new Error('Failed to generate recommendations');
    }
}
//route for some new additiion to teh features 

// router.get("/coins",isLoggedIn,async (req,res)=>{
//     const username = req.session.passport.user
//     const user = await userModel.findOne({username:username})
//     res.render("coin-page");
// })


//route for recommending products
router.get("/recommend", isLoggedIn, async (req, res) => {
    try {
        const user = await userModel.findOne({ username: req.session.passport.user });
        const recProducts = await recommendProducts(user._id);
        res.render('recommend', { recommendedProducts: recProducts });
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to fetch recommendations');
    }
});





router.get('/bot',(req,res)=>{
    res.render("chatbot")
})
//related to order and products
router.get("/product/:id",isLoggedIn,async (req,res)=>{
    const product = await productModel.findById(req.params.id);
    const review = await reviewModel.find({productid:product._id}).populate("user");
    res.render("product-detail",{product,review})
})
router.get("/review/:id",isLoggedIn,async (req,res)=>{
    const product = await productModel.findById(req.params.id);
    const user = await productModel.findByUsername(req.session.passport.user);
    res.render("product-detail",{product,user});

})
router.post("/review/:id",isLoggedIn,upload.single("reviewImage"),async (req,res)=>{
    const product = await productModel.findById(req.params.id);
    const user = await userModel.findByUsername(req.session.passport.user)
    const review = await reviewModel.create({
        reviewImage:req.file.filename,
        reviews:req.body.reviews,
        productid:req.params.id,
        product:product.title,
        user:user._id
    })
    await review.save();
    res.redirect(`/product/${product._id}`)

})
router.get("/place-order/:productid",isLoggedIn,async (req,res)=>{
    const product = await productModel.findById(req.params.productid);

    res.render("order-form",{product})
})
router.post("/place-order/:id",isLoggedIn,async (req,res)=>{
    const product = await productModel.findById(req.params.id);
    const user = await userModel.findByUsername(req.session.passport.user)
    const seller = await sellerModel.findOne({products:product._id})

    const order = await orderModel.create({
        product:product._id,
        user:user._id,
        productname:product.title,
        address : req.body.address,
        username : user.username,
        price: product.price,
        mode:req.body.mode,
        contact:req.body.contact,
        productImage:product.productImage,
        status:"ordered"
    })
    await order.save(),
    user.orders.push(order._id);
    await user.save()
    seller.sales.push(order._id)
    await seller.save()
    res.redirect(`/payment/${product._id}`)
})
router.get("/yourorder",isLoggedIn,async (req,res)=>{
    const user = await userModel.findByUsername(req.session.passport.user).populate("orders");
    const order = await orderModel.find({user:user._id});
    res.render("yourorder",{user});
})
router.get("/s-Orders/:id",async (req,res)=>{
    const seller = await sellerModel.findById(req.params.id).populate('sales');
    res.render("seller-order",{seller})
})

// Route for seller profile page
router.get('/sprofile', async function(req, res) {
    try {
        const username = req.session.username;
        
        if (!username) {
            return res.redirect('/slogin');
        }

        const seller = await sellerModel.findOne({ username: username }).populate('products');
        console.log(seller);

        if (!seller) {
            return res.redirect('/slogin');
        }

        res.render('seller-profile', { seller: seller });
    } catch (error) {
        console.error(error);
        res.redirect('/slogin');
    }
});

router.post("/add-to-cart/:productId",isLoggedIn,async (req,res)=>{
    const productId = req.params.productId;
    const username = req.session.passport.user;
    console.log(username)
    const user = await userModel.findByUsername(username)
    user.cart.push(productId);
    await user.save();
    console.log(user)
    res.status(200)
})


//code for cart 

router.get("/cart/:username",isLoggedIn,async (req,res)=>{
    const username = req.params.username;
    console.log(username)
    const user = await userModel.findOne({username:username}).populate('cart');
    console.log(user)
    res.render("cart",{user})
})


// router.delete("/remove-from-cart/:productId",isLoggedIn,async (req,res)=>{
//     const productId = req.params.productId;
//     const username = req.session.passport.user;
//     const user = await userModel.findByUsername(username)
//     user.cart.pull(productId);
//     await user.save();
//     console.log(user)
//     console.log("removed");
//     res.status(200)
// })
router.delete("/removefromcart/:productId", async (req, res) => {
    const productId = req.params.productId;
    const username = req.session.username;

    try {
        await userModel.updateOne(
            { username: username },
            { $pull: { cart: productId } }
        );
        res.sendStatus(204);
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.sendStatus(500);
    }
});

// Route to view specific product details
router.get('/product/:productId', async (req, res) => {
    try {
        const productId = req.params.productId;
        const product = await productModel.findById(productId);
        if (!product) {
            return res.status(404).send('Product not found');
        }
        res.render('product-detail', { product });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



//ROUTES FOR DETAILED ORDERS 

// router.get("/detailedorder/:productid",isLoggedIn,async (req,res)=>{
//     const productid = req.params.productid
//     const username = req.session.passport.user
//     const user = await userModel.findOne({username:username})
//     const product = await productModel.findOne({_id:productid})
//     const order = await orderModel.findOne({product:productid})
//     res.render("detailedorder",{order,product,user});
// })

//GET ROUTES FOR ADVWRTISEMNT 

// res.get("/advertisement/:sellerid",isLoggedIn,async (req,res)=>{
//     const sellerid = req.params.sellerid;
//     const seller = await sellerid.findOne({_id:sellerid})
//     const product = await productModel.find({seller:sellerid})
//     res.render("advertisement");
// })





router.get("/home",isLoggedIn,async(req,res)=>{
    const user = await userModel.findOne({
        username:req.session.passport.user
    })
    res.render('home',{user})
})

router.get("/product",isLoggedIn,async (req,res)=>{
    const user = req.session.passport.user
    let products = await productModel.find()
    console.log(products,user)

    res.render('products',{products,user});
})
router.get("/addproduct", async (req, res) => {
    const username = req.query.username;
    console.log(username);
    if (!username) {

        return res.redirect("/sprofile");
    }
    const seller = await sellerModel.findOne({ username: username });
    if (!seller) {

        return res.redirect("/sprofile"); 
    }
    const product = await productModel.find({seller:seller._id})
    // console.log(product)
    // console.log(seller)
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
        res.redirect('/home');
    });
});

});

router.post('/login',passport.authenticate("local",{
    successRedirect: "/home",
    failureRedirect: "/"
}),async function( req,res){
    // let user = await userModel.findOne({username: req.session.passport.user});
    // user.fcmToken = fcmToken;
    // await user.save();
    
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
router.get("/team",(req,res)=>{
    res.render("team")
})
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
            req.session.username = user.username; 
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

router.post("/updatestatus/:orderid",async (req,res)=>{
    const order = await orderModel.findOne({_id:req.params.orderid});
    order.status = req.body.mode;
    await order.save();
    res.redirect("/sprofile")
})
  router.post('/setproduct', upload.single('productImage'), async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/sprofile')
    }

    try {
        const username = req.session.username;
        const seller = await sellerModel.findOne({ username: username });
        console.log(seller)

        if (!seller) {
            return res.redirect('/sprofile');
        }

        const product = await productModel.create({
            seller: seller._id,
            price: req.body.price,
            title: req.body.title,
            brand: req.body.brand,
            productImage: req.file.filename,
            description:req.body.description,
            type:req.body.type
        });
        seller.products.push(product._id);

        await seller.save();
        console.log(product)

        res.redirect('/sprofile');
    } catch (error) {
        console.error(error);
        res.redirect('/sprofile');
    }
});

module.exports = router;
