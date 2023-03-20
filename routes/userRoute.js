const express = require("express")
const user_route = express();
user_route.set('view engine','ejs');
const Razorpay = require('razorpay');
// const mongoose = require('mongoose')
//schema and model
// const userSchema = new mongoose.Schema({
//     users: Number,
// }) 

// const OTP = mongoose.model("OTP",userSchema)

const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
var serviceId = process.env.Service_SID
const session = require('express-session')
user_route.use(session({
    secret: 'keyboard cat',
  }))

  var instance = new Razorpay({
    key_id:process.env.RAZORPAY_API_KEY,
    key_secret:process.env.RAZORPAY_APT_SECRET,
  });


const client = require('twilio')(accountSid, authToken);



const crypto = require('crypto')  
const userController = require("../controllers/userController")


const productController = require("../controllers/product")

const categoryController = require("../controllers/category")

const auth = require("../middleware/auth")

user_route.set('views','./views/customers')
const bodyParser = require('body-parser');
user_route.use(bodyParser.json());
user_route.use(bodyParser.urlencoded({extended:true}))



 user_route.get('/register',auth.isLogout,userController.loadRegister)

 user_route.post('/register',userController.insertUSer)

user_route.get('/login',auth.isLogout,userController.login)
user_route.post('/login', userController.verifyLogin)
user_route.get('/',userController.loadHome)
user_route.get('/verify',userController.verifyMail);

user_route.get('/loginWithOtp',(req,res)=>{
    res.render('loginWithOtp')

    

})
user_route.post('/loginWithOtp',userController.insertOtp)
//confirm otp
user_route.get('/confirm-otp',userController.confirmLoadOtp)

user_route.post('/confirm-otp',userController.verifyOtp)

user_route.get('/forget',userController.loadForgetPassword)

user_route.post('/forget',userController.forgetVerify)

user_route.get('/forget-password',userController.forgetPasswordLoad)

user_route.post('/forget-password',userController.resetPassword)

user_route.get('/view-product',userController.viewProduct)

user_route.get('/resend-otp',userController.resendOtp)

user_route.get('/category',categoryController.category)

user_route.get('/shop',userController.shop)

user_route.get('/logout',userController.logout)

user_route.get('/view-profile',userController.viewProfile)

user_route.get('/add-address',userController.Address)

user_route.post('/add-address',userController.addAddress)

user_route.get('/edit-profile',userController.userProfile)

user_route.post('/edit-profile',userController.editProfile)

user_route.get('/add-cart/:productId',userController.addCart)

user_route.get('/cart',userController.viewCart)

user_route.get('/delete-item',userController.deleteItem)

user_route.get('/add-wishlist/:productId',userController.addWhishList)

user_route.get('/wishlist',userController.loadWhishList)

user_route.post('/cart/:productId',userController.increment)

user_route.get('/cart/:productId',userController.decrement)

user_route.get('/delete-wishlist',userController.deleteWishList)

user_route.get('/checkout',userController.checkout)

user_route.post('/checkout',userController.postCheckOut)

user_route.get('/confirm-order',userController.confirmOrder)

user_route.get('/view-address',userController.viewAddress)

user_route.get('/delete-address',userController.deleteAddress)

user_route.get('/edit-addresses',userController.viewEditAddress)

user_route.post('/edit-addresses',userController.editAddress)

user_route.get('/order-list',userController.orderList)

user_route.get('/view-order',userController.viewOrder)

user_route.post('/cancel-order',userController.cancelOrder)

user_route.post('/create_order',userController.loadamount)

user_route.post('/postpayment',userController.postPay)

user_route.get('/sortH',userController.sortH)

user_route.get('/sortL',userController.sortL)

user_route.get('/sortH1',userController.sortH1)

user_route.get('/sortL1',userController.sortL1)

user_route.post('/check_coupen',userController.checkCoupen)

user_route.post('/return-reason',userController.returnReason)

user_route.post("/search",userController.search1)










   

    







module.exports =  user_route
  
