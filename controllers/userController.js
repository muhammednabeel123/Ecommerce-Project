const Customer = require('../models/userModel')
const bcrypt = require('bcrypt')
const nodemailer = require("nodemailer");
const randomstring = require("randomstring");
const { findOne, findById, findByIdAndUpdate, count, findOneAndDelete } = require('../models/userModel');
const addProductModel =  require('../models/Products')
const addCategoryModel =  require('../models/category');
const Cart = require('../models/cart')
const { render, search } = require('../routes/adminRoute');
const { ObjectId } = require('mongodb');
const Products = require('../models/Products');
const { UserBindingContextImpl } = require('twilio/lib/rest/chat/v2/service/user/userBinding');
const Wishlist = require('../models/whishlist');
const Order = require('../models/order')
const Admin = require('../models/adminModel');
const Razorpay = require('razorpay');
const crypto = require('crypto')
const moment = require('moment');
const Coupen = require('../models/coupen');
const { max } = require('moment');
const Banner = require('../models/banner');
const { request } = require('https');


var instance = new Razorpay({
    key_id:process.env.RAZORPAY_API_KEY,
    key_secret:process.env.RAZORPAY_APT_SECRET,
  });

// const whishlist = require('../models/whishlist');




const accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
var serviceId = process.env.Service_SID


const client = require('twilio')(accountSid,authToken);

const securePassword = async (password) => {
    try {
        const passwordhash = await bcrypt.hash(password, 10)

        return passwordhash;

    } catch (error) {
        console.log(error.message)
next(error.message)

    }
}
//for send mail
const sendVerifyMail = async (name, email, user_id) => {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'muhammednabeel237@gmail.com',
                pass: 'zcxcsrtqaydaxqsu'
            }

        });
        const mailOptions = {
            from: 'muhammednabeel237@gmail.com',
            to: email,
            subject: 'for verification mail',
            html: '<p> hloo ' + name + ',please click here to <a href="http://127.0.0.1:3000/verify?id=' + user_id + '">verify </a></p> '
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email has been sent:-", info.response)
            }
        })
    }
    catch (error) {
        console.log(error.message)
next(error.message);
    }


}
const verifyMail = async (req, res) => {
    try {
        const updateInfo = await Customer.updateOne({ _id: req.query.id }, { $set: { is_verfied: 1 } })
        console.log(updateInfo);
        res.render("email-verified")

    } catch (error) {

    }
}

const loadRegister = async (req, res) => {
    try {
        res.render('register')

    } catch (error) {
        console.log(error.message)
next(error.message)
    }
}
const insertUSer = async (req, res) => {

    try {

        const emailexist = await Customer.find({ email: req.body.email })
        const mobileexist = await Customer.find({ mobile:"+91"+ req.body.mno })


        console.log(req.body.mno)



        if (!emailexist.length && !mobileexist.length ) {
            console.log(req.body,"1")
            req.session.userData = req.body


        


            // const userData = await customer.save()
            if (req.session.userData) {
                if (req.session.userData.mno) {
                    // sendVerifyMail(req.body.name, req.body.email, userData._id)
                    client.verify.v2.services(serviceId)
                        .verifications
                        .create({ to: "+91" + req.session.userData.mno, channel: 'sms' })
                        .then(verification => console.log(verification.status));
                    req.session.userData
                    // req.session.mobile=req.body.mno,

                    res.render('cnfrmOtp', { message: "Enter your Otp" })
                } else {
                    console.log("session error")
                }

            }


            else {
                res.render('register', { message: "failed" })
                console.log("submit failed")
            }




        } else {
            res.render('register', { message: "Acount already exists" })
        }












    } catch (error) {
        console.log(error.message)
next(error.message)

    }

}
const resendOtp = async(req,res,next)=>{
    try {

        number = req.session.userData.mno 
        console.log(number);
        client.verify.v2.services(serviceId)
                            .verifications
                            .create({ to: "+91" + number, channel: 'sms' })
                            .then(verification => console.log(verification.status));
                            res.redirect('/confirm-otp')
        
    } catch (error) {
       console.log(error.message)
next(error.message); 
        
    }
}



const verifyLogin = async (req,res,next) => {
    try {
        // console.log(req.body)
        const email = req.body.email;
        const password = req.body.password;


        const userData = await Customer.findOne({ email: email })
            // console.log(userData)
        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {
                if(userData.is_verfied === 0){
                    res.render('login', { message: "You are temporarily blocked " })
                   
                }else{
                    req.session.userId = userData._id
                    res.redirect('/');
                    console.log(req.session.userId,"session created")

                }



               



            }
            else {
                res.render('login', { message: "Password Incorrect" })
                console.log("submit1 failed")

            }



        } else {
            res.render('login', { message: "Email or password incorrect" })
            console.log("submit failed2")
        }

    } catch (error) {
        console.log(error.message)
next(error.message)
        console.log("submit failed 3")
    }

}
const loadHome = async (req, res) => {
    
    
   

    try {
       
       
        if(req.session.userId){
            var search=''
            if(req.query.search){
                search = req.query.search
            }
            const categoryData = await addCategoryModel.find({__v:0});

            // console.log(categoryData)
            var page = 1;
            if(req.query.page){
                page = req.query.page
            }

            const limit = 6;
            const productData = await addProductModel.find({__v:0,
            $or:[{ name:{ $regex:'.*'+search+'.*',$options:'i'  }}]})
            .limit(limit * 1).skip((page - 1)*limit).exec();

          
            const count = await addProductModel.find({__v:0,
                $or:[{ name:{ $regex:'.*'+search+'.*',$options:'i'  }}]})
                .countDocuments()
               

        
            

           
        
           
          
            
            const id = req.session.userId
    
            const userData = await Customer.findById({_id:id})
           
            const ProductCount = await Cart.findOne({user:ObjectId(userData)})

            productMax =  await productData.category

            // console.log( productMax,"printed")

            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})
            const bannerData = await Banner.find({})

            // console.log(ProductCount)
            if(ProductCount !== null && ProductCount1 !== null )
            {
                const cartcount = ProductCount.products.length
                const wishlistCount = ProductCount1.products.length
                // console.log("1");
                res.render('home',{user:userData,product:productData,categorys:categoryData,cartcount,wishlistCount,totalPages: Math.ceil(count/limit),currentPage:page,bannerData})
                
            }else if(ProductCount !== null){
                const cartcount = ProductCount.products.length
                // console.log("2");

                

                res.render('home',{user:userData,product:productData,categorys:categoryData,cartcount,wishlistCount:"null ",totalPages:Math.ceil(count/limit),currentPage:page,bannerData})
            }
            else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

                // console.log("3");

                res.render('home',{user:userData,product:productData,categorys:categoryData,cartcount:"null" ,wishlistCount,totalPages:Math.ceil(count/limit),currentPage:page,bannerData})

            }else{
                res.render('home',{user:userData,product:productData,categorys:categoryData,cartcount:0 ,wishlistCount:0,totalPages:Math.ceil(count/limit),currentPage:page,bannerData})
                // console.log("4");
            }

           
           
         

        }
        else {
            var search=''
            if(req.query.search){
                search = req.query.search
            }
            const categoryData = await addCategoryModel.find({__v:0});

            // console.log(categoryData)
            var page = 1;
            if(req.query.page){
                page = req.query.page
            }

            const limit = 4;
            const productData = await addProductModel.find({__v:0,
            $or:[{ name:{ $regex:'.*'+search+'.*',$options:'i'  }}]})
            .limit(limit * 1).skip((page - 1)*limit).exec();

            
            const count = await addProductModel.find({__v:0,
                $or:[{ name:{ $regex:'.*'+search+'.*',$options:'i'  }}]})
                .countDocuments()
               
            const bannerData = await Banner.find({})

            const userData = req.session.userId
           
            let  cartcount = null
            res.render('home',{user:userData,product:productData,categorys:categoryData,cartcount,wishlistCount:0,totalPages:Math.ceil(count/limit),currentPage:page,bannerData})

        }

      


       
       

    } catch (error) {
        console.log(error.message)
        next(error.message)
    }
}




//creating otp

const insertOtp = async (req, res) => {
    try {
        // console.log(req.body, 'jksdhfgjkldhfg')
        // console.log(req.body.mno)
        req.session.userData = req.body
        let Number = req.session.userData.mno
        const userData = await Customer.findOne({ mobile: "+91" + Number })
        console.log(userData)





        if (userData) {
            // console.log(userData)
            const mobileMatch = await "+91" + Number === userData.mobile
            // console.log(mobileMatch)
            if (mobileMatch && userData.is_verfied === 1) {
                {
                    function sendTextMessage() {
                        console.log("mobile match2")

                        client.verify.v2.services(serviceId)
                            .verifications
                            .create({ to: "+91" + Number, channel: 'sms' })
                            .then(verification => console.log(verification.status,"there"));



                    }
                    sendTextMessage()
                    req.session.userData
                    console.log(req.session.userData)

                    res.redirect('/confirm-otp')


                }

            } 
            else {
                res.render("loginWithOtp",{message:"Please signup!! or You are temporarly blocked"})

            }

        } else {
            res.render("loginWithOtp",{message:"Please signup!!"})

        }




    } catch (error) {
        console.log(error.message)
next(error.message)

    }


}
const confirmLoadOtp = async (req, res) => {
    try {
        res.render('cnfrmOtp')

    } catch (error) {
        console.log(error.message)
next(error.message)
    }
}
const verifyOtp = async (req, res) => {
    console.log('mobile');

    try {

        const otp = req.body.otp
       
        const mobile = req.session.userData.mno
      
        if (req.session) {

            client.verify.v2.services(serviceId)
                .verificationChecks
                .create({ to:"+91"+ mobile, code: otp })
                .then((verification_check) => {
                    console.log(verification_check.status)
                    if (verification_check.status === 'approved') {
                        if (req.session.userData.name) {
                          
                            (async function otp() {

                                const spassword = await securePassword(req.session.userData.password);

                                const customer = new Customer({
                                    name: req.session.userData.name,
                                    email: req.session.userData.email,
                                    mobile: "+91" + req.session.userData.mno,
                                    password: spassword,
                                    is_verfied: 1

                                  



                                })
                                console.log(mobile,'mobile registering')

                                const userData = await customer.save();
                                req.session.userId = userData._id
                                console.log(req.session.userId,"session 2")
                                res.redirect("/")

                            })()





                            
                        }else{
                            (async function findUser() {
                                // console.log(req.session.userData.mno)
                                const userData = await Customer.findOne({ mobile:"+91"+req.session.userData.mno })
                                // console.log(userData)

                                req.session.userId = userData._id
                                // console.log(req.session.userId,"session 3")
                                res.redirect("/")
                            })()

                        }
                    } else {
                        res.render('cnfrmOtp', { message: "Invalid Otp" })
                    }
                });


        }
        else {
            res.resend('cnfirmOtp2', { message: "no user data" })

        }






    } catch (error) {
        console.log(error.message)
next(error.message)

    }


}
//load forgetpassword

const loadForgetPassword = async (req, res) => {

    try {

        res.render('forget')



    } catch (error) {
        console.log(error.message)
next(error.message);

    }

}
const forgetVerify = async (req, res) => {
    try {
        const email = req.body.email;

        const userData = await Customer.findOne({ email: email });
        console.log(userData)
        if (userData) {

            if (userData.is_verfied === 0) {
                res.render('forget', { message: "please verify your mail." })

            }
            else {
                const randomString = randomstring.generate();
                const updatedData = await Customer.updateOne({ email: email }, { $set: { token: randomString } })
                sendResetPasswordMail(userData.name, userData.email, randomString)
                res.render('forget', { message: "please check your mail to reset your password" })





            }




        }
        else {
            res.render('forget', { message: "User email incorrect" })
        }


    } catch (error) {
        console.log(error.message)
next(error.message)

    }

}
const sendResetPasswordMail = async (name, email, token) => {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: 'muhammednabeel237@gmail.com',
                pass: 'zcxcsrtqaydaxqsu'
            }

        });
        const mailOptions = {
            from: 'muhammednabeel237@gmail.com',
            to: email,
            subject: 'for Reset Password ',
            html: '<p> hloo ' + name + ',please click here to <a href="http://127.0.0.1:3000/forget-password?token=' + token + '">Reset your password</a></p> '
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email has been sent:-", info.response)
            }
        })
    }
    catch (error) {
        console.log(error.message)
next(error.message);
    }
}
const forgetPasswordLoad = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await Customer.findOne({ token: token })
        if (tokenData) {
            res.render('forget-password1', { user_id: tokenData._id })
        }
        else {
            res.render('400', { message: "Token is invalid." })
        }


    } catch (error) {

    }


}

//userlogout
const userLogout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/');

    } catch (error) {
        console.log(error.message)
next(error.message)

    }

}
const resetPassword = async (req, res) => {
    try {
        const password = req.body.password
        const user_id = req.body.user_id

        const secure_password = await securePassword(password)

        const updatedData = await Customer.findByIdAndUpdate({ _id: user_id }, { $set: { password: secure_password, token: '' } })
        res.redirect('/register')
        console.log('1', token);


    } catch (error) {
        console.log(error.message)
next(error.message);

    }
}

const viewProduct = async(req,res,next) =>{
    try {
        if(req.session.userId){
           
            const id = req.query.id
            const productData =  await addProductModel.findById({_id:id})
            const categoryData = await addCategoryModel.find({})
            const userData =  await Customer.findById({_id:req.session.userId})
            // const ProductCount = await Cart.findOne({user:user._id})
            // console.log('product not added but ',ProductCount);
            
            // const cartcount = ProductCount.products.length
            const ProductCount = await Cart.findOne({user:ObjectId(userData)})

            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})
    

            // console.log(ProductCount)
            if(ProductCount !== null && ProductCount1 !== null )
            {
                    const cartcount = ProductCount.products.length
                    const wishlistCount = ProductCount1.products.length
                    // console.log("1");
                    res.render('shop-details',{product:productData,category:categoryData,user:userData,userData,cartcount,wishlistCount})
        
                }else if(ProductCount !== null){

                    const cartcount = ProductCount.products.length
                    // console.log("2321321");

                    

                    res.render('shop-details',{product:productData,category:categoryData,user:userData,userData,wishlistCount:0})
                }
                else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

                // console.log("332332");

                res.render('shop-details',{product:productData,category:categoryData,user:userData,userData,cartcount:0 ,wishlistCount})

            }else{

                res.render('shop-details',{product:productData,category:categoryData,user:userData,userData,cartcount:0,wishlistCount:0})
                // console.log("4");
            }

            // console.log(cartcount,"heree")

            // res.render('shop-details',{ product:productData,category:categoryData,user:userData,userData,cartcount,wishlistCount:'null' })
        }

       else{
        const id = req.query.id
        const productData =  await addProductModel.findById({_id:id})
        const categoryData = await addCategoryModel.find({})
        const userData = req.session.userId
        let  cartcount = null
        res.render('shop-details',{ product:productData,category:categoryData,user:userData,cartcount,wishlistCount:0})

       }

        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}

const login = async(req,res,next) =>{
    try {
        res.render('login')
        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}

const shop = async(req,res,next) =>{
    try {
        if(req.session.userId){
            var search=''
            if(req.query.search){
                search = req.query.search
            }
    
            
            const categoryData = await addCategoryModel.find({})

            var page = 1;
            if(req.query.page){
                page = req.query.page
            }
            
             const limit = 3;
            const productData = await addProductModel.find({__v:0,
            $or:[{ name:{ $regex:'.*'+search+'.*',$options:'i'  }}]})
            .limit(limit * 1).skip((page - 1)*limit).exec();

            
            const count = await addProductModel.find({__v:0,
                $or:[{ name:{ $regex:'.*'+search+'.*',$options:'i'  }}]})
                .countDocuments()
               
            const userData = await Customer.findById({_id:req.session.userId})
    
            const ProductCount = await Cart.findOne({user:ObjectId(userData)})

            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})

            // console.log(ProductCount)
            if(ProductCount !== null && ProductCount1 !== null )
            {
                const cartcount = ProductCount.products.length
                const wishlistCount = ProductCount1.products.length
                
                res.render('shop',{product:productData,category:categoryData,user:userData,cartcount,wishlistCount,totalPages: Math.ceil(count/limit),currentPage:page})
                
            }else if(ProductCount !== null){

                const cartcount = ProductCount.products.length
              

                

                res.render('shop',{product:productData,category:categoryData,user:userData,cartcount,wishlistCount:0,totalPages: Math.ceil(count/limit),currentPage:page})
            }
            else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

             

                res.render('shop',{product:productData,category:categoryData,user:userData,cartcount:0,wishlistCount,totalPages: Math.ceil(count/limit),currentPage:page})

            }else{

                res.render('shop',{product:productData,category:categoryData,user:userData,cartcount:0,wishlistCount:0,totalPages: Math.ceil(count/limit),currentPage:page})
                console.log("4");
            }


        }
        else{

           
            const categoryData = await addCategoryModel.find({__v:0});

            // console.log(categoryData)
          

            const limit = 3;
            const productData = await addProductModel.find({__v:0,})
            

        
            const count = await addProductModel.find({})
                
               
            const userData = req.session.userId
            let cartcount = 0
            let wishlistCount = 0

        res.render('shop',{product:productData,category:categoryData,user:userData,cartcount,wishlistCount,totalPages:Math.ceil(count/limit),currentPage:page})

        }
        



        
    } catch (error) {
        console.log(error.message)
        next(error.message);
        
    }
}
const logout = async(req,res,next)=>{
    try {
        req.session.destroy();
        
        res.redirect('/');
    }
    catch(error){
        console.log(error.message)
        next(error.message);
    }
}
const viewProfile = async(req,res,next)=>{
    try {
        if(req.session.userId){

            const categoryData = await addCategoryModel.find({})

            const productData = await addProductModel.find({})

            const userData = await Customer.findById({_id:req.session.userId})

            // const ProductCount = await Cart.findOne({user:ObjectId(userData)})
            
            // const cartcount = ProductCount.products.length

            const ProductCount = await Cart.findOne({user:ObjectId(userData)})

            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})

            // console.log(ProductCount)
            if(ProductCount !== null && ProductCount1 !== null )
            {
                const cartcount = ProductCount.products.length
                const wishlistCount = ProductCount1.products.length
                // console.log("1");
                res.render('view-profile',{product:productData,category:categoryData,user:userData,cartcount,wishlistCount})
                
            }else if(ProductCount !== null){

                const cartcount = ProductCount.products.length
                // console.log("2321321");

                

                res.render('view-profile',{product:productData,category:categoryData,user:userData,cartcount,wishlistCount:0})
            }
            else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

                // console.log("332332");

                res.render('view-profile',{product:productData,category:categoryData,user:userData,cartcount:0,wishlistCount})

            }else{

                res.render('view-profile',{product:productData,category:categoryData,user:userData,cartcount:0,wishlistCount:0})
                // console.log("4");
            }
            

        // res.render('view-profile',{product:productData,category:categoryData,user:userData,cartcount})

       

         



           
        }
        else{
           
            const categoryData = await addCategoryModel.find({})

            const productData = await addProductModel.find({})

            const userData = req.session.userId

            let  cartcount = null

        res.render('view-profile',{product:productData,category:categoryData,user:userData,cartcount,wishlistCount:0})

        }
       
        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}

const Address = async(req,res,next) =>{
    try {
        if(req.session.userId){
            
            const userData = await Customer.findById({_id:req.session.userId})
            // const ProductCount = await Cart.findOne({user:ObjectId(userData)})
            
            // const cartcount = ProductCount.products.length

            const ProductCount = await Cart.findOne({user:ObjectId(userData)})

            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})

            // console.log(ProductCount)
            if(ProductCount !== null && ProductCount1 !== null )
            {
                    const cartcount = ProductCount.products.length
                    const wishlistCount = ProductCount1.products.length
                    // console.log("1");
                    res.render('add-address',{user:userData,cartcount,wishlistCount})
                    
                }else if(ProductCount !== null){

                    const cartcount = ProductCount.products.length
                    // console.log("2321321");

                    

                    res.render('add-address',{user:userData,cartcount,wishlistCount:0})
                }
                else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

                // console.log("332332");

                res.render('add-address',{user:userData,cartcount:0,wishlistCount})

            }else{

                res.render('add-address',{user:userData,cartcount:0,wishlistCount:0})
                // console.log("4");
            }
            
 
            
            //  res.render('add-address',{user:userData,cartcount})
            
        }
        else{
            res.redirect('/login')
        }
        
        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
        
    }
}


const addAddress = async(req,res,next) =>{
    try {
        if (req.session.userId) {


            address2={
                address1:req.body.address,
                postalcode:req.body.postcode,
                street:req.body.area,
                country:req.body.country,
                state:req.body.state,
                district:req.body.district

            }
        

            const userData = await Customer.findByIdAndUpdate({_id:req.session.userId},{$push:{
              
                address:{...address2}


            }})
            res.redirect('/')


            
        } else {
            res.redirect('/login')
            
        }
        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
} 

const userProfile = async(req,res,next)=>{
    try {
        if(req.session.userId){
            const userData = await Customer.findById({_id:req.session.userId})
            const ProductCount = await Cart.findOne({user:ObjectId(userData)})

            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})

            // console.log(ProductCount)
            if(ProductCount !== null && ProductCount1 !== null )
            {
                    const cartcount = ProductCount.products.length
                    const wishlistCount = ProductCount1.products.length
                    // console.log("1");
                    res.render('edit-profile',{user:userData,cartcount,wishlistCount})
                    
                }else if(ProductCount !== null){

                    const cartcount = ProductCount.products.length
                    // console.log("2321321");

                    

                    res.render('edit-profile',{user:userData,cartcount,wishlistCount:0})
                }
                else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

                // console.log("332332");

                res.render('edit-profile',{user:userData,cartcount:0,wishlistCount})

            }else{

                res.render('edit-profile',{user:userData,cartcount:0,wishlistCount:0})
                // console.log("4");
            }
            
            

            // res.render('edit-profile',{user:userData,cartcount})
            
        }
        else{
            res.redirect('/')
        }
       
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}

const editProfile = async(req,res,next)=>{
    try {



        if(req.session.userId){
           const address2={
                address1:req.body.address,
                postalcode:req.body.postcode,
                street:req.body.area,
                country:req.body.country,
                state:req.body.state,
                district:req.body.district

            }
           
            const customerdata = await Customer.findById({_id:req.session.userId})
           
            const userData = await Customer.findByIdAndUpdate({_id:req.session.userId},{$set:{
                name:req.body.name,
                email:req.body.email,
                address:{...address2}
            }})
           


            res.redirect('/view-profile')
            
        }
        else{
            res.redirect('/')
        }


        
    } catch (error) {
        console.log(error.message)
next(error.message)
    }
}

const addCart = async(req,res,next)=>{
    try {
        if(req.session.userId){

            id= req.params.productId

     

            const productData  = await  addProductModel.findById({_id:id})

        

            const userData = await Customer.findById({_id:req.session.userId})

            let price = productData.price

            

            const cartData = await Cart.findOne({user:ObjectId(userData)})

         

           

            if(cartData){
                    const cartMatch = await Cart.findOne({user:req.session.userId,products:{$elemMatch:{item:id}}})
                    if (cartMatch === null) {

                    const cartitem = {
                        item:ObjectId(productData),
                        quantity:1,
                        pricetotal:price
                     
                    }
    
                    
                    // console.log(cartData,"cartdata added")
                    const cartDataUpdate = await Cart.updateOne({user:ObjectId(userData)},{$push:{products:{...cartitem}}})
                    // console.log(cartDataUpdate,"cartdata updated")
                    res.json({success:"success"})
                    
    
    
                } else {
                

                    const cartData = await Cart.findOneAndUpdate({user:req.session.userId,'products.item':id},{
                        $inc:{"products.$.quantity": 1,"products.$.pricetotal": +price},
                    
                        // $set:{"products.$.pricetotal": {$mul: ["products.$.quantity",price]}}
                    })
                    

                    //  const cart1Data = await Cart.findOneAndUpdate({user:req.session.userId,'products.item':id},{$mul:{"products.$.pricetotal": 2 }})
    
                 
                    res.json({success:"success"})

                     

                }
            }else{
                   
                    const cartdata = new Cart({
                        user:userData,
                        products:[{item:ObjectId(productData),
                        quantity:1,
                        pricetotal:productData.price}]
                    })
                    const cartData = await cartdata.save()
                   
                    res.json({success:"success"})
                }
    
               
                
            }
        
        else{
            res.json({success:"failed"})
        }
        

        
    } catch (error) {
        console.log(error)
    }

    }
    
const viewCart = async(req,res,next)=>{
    try {
        if (req.session.userId) {
            const userData = await Customer.findById({_id:req.session.userId})
            const cartData = await Cart.findOne({user:ObjectId(userData)}).populate('products.item')
           
           
            const cartProducts = cartData.products
            console.log(cartProducts.length !== 0 )
            if (cartData) {
                const cartItem = await cartData.products
                const prodata = cartItem.map(n=>n.item)
            
    
    
    
                const productData = await addProductModel.find({_id:{$in:prodata} })
    
                const ProductCount = await Cart.findOne({user:ObjectId(userData)})
    
                const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})
                if(ProductCount !== null && ProductCount1 !== null )
            {
                
                const cartcount = ProductCount.products.length
                const wishlistCount = ProductCount1.products.length
            
                res.render('shoping-cart',{user:userData,cartData,product:productData,cartItem,cartcount,wishlistCount})
                
            }else if(ProductCount !== null){

                const cartcount = ProductCount.products.length

                

                res.render('shoping-cart',{user:userData,cartData,product:productData,cartItem,cartcount,wishlistCount:0})
            }
            else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length


                res.render('shoping-cart',{user:userData,cartData,product:productData,cartItem,cartcount:0,wishlistCount})

            }else{

                res.render('shoping-cart',{user:userData,cartData,product:productData,cartItem,cartcount:0,wishlistCount:0})
            }
    
                
            }else{
                res.render('shoping-cart',{user:userData,cartData:null,cartItem:null,cartcount:0,wishlistCount:0})

            }
            
            
            
           
        
            
            
        } else {

            res.redirect('/login')
            
        }

        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}

const deleteItem = async(req,res,next)=>{
try {
    
    id=req.query.id


    const userData= await Customer.findById({_id:req.session.userId})

    
    await Cart.updateOne({user:ObjectId(userData)},{$pull:{products:{item:req.query.id}}})

    res.redirect('/cart')

} catch (error) {

    console.log(error.message)
next(error.message)
    
}

    
}
const addWhishList = async(req,res,next)=>{
    try {
        if (req.session.userId) {

            id = req.params.productId

            

            const productData = await addProductModel.findById({_id:id})

            // console.log(productData)

            const userData = await Customer.findById({_id:req.session.userId})

            // console.log(userData)

            const wishlistData = await Wishlist.findOne({user:ObjectId(userData)})

            // console.log(wishlistData)

            if(wishlistData){

                const wishlistMatch = await Wishlist.findOne({user:req.session.userId,products:{$elemMatch:{item:id}}})

                

                if(wishlistMatch === null){
                    const wishlistitem = {
                        item:ObjectId(productData)
                    }
                    const wishlistUpdate = await Wishlist.updateOne({user:ObjectId(userData)},{$push:{products:{...wishlistitem}}})

                   

                    res.json({success:"success"})


                }else{
                    res.json({success:"success"})

                }

            }
            else{
              

               const productData = await addProductModel.findById({_id:id})
               
               const wishlistData = new Wishlist({
                user:userData,
                products:[{item:ObjectId(productData)}]
               })
               const whishlistData = await wishlistData.save()
               
             

               res.json({success:"success"})




            }

            
        } else {

            res.json({success:"failed"})
        }
        
    } catch (error) {

        console.log(error.message)
next(error.message)
        
    }
}

const loadWhishList = async(req,res,next) =>{
    try {
    

        if (req.session.userId) {

           

        
            const userData = await Customer.findById({_id:req.session.userId})
            // console.log(req.headers,"what the heck is this")
           

            const wishlistData = await Wishlist.findOne({user:ObjectId(userData)})
            if(wishlistData){
                const cartItem = await wishlistData.products

                const prodata = cartItem.map(n=>n.item)
    
                // console.log(prodata,'prodata')
    
                const product = await addProductModel.find({_id:{$in:prodata}}) 
    
    
                const ProductCount = await Cart.findOne({user:ObjectId(userData)})
    
                const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})
                if(ProductCount !== null && ProductCount1 !== null )
                {
                    const cartcount = ProductCount.products.length
                    const wishlistCount = ProductCount1.products.length
                  
                    res.render('whishlist',{user:userData,cartcount,product,wishlistData,cartItem,cartcount,wishlistCount})
                    
                }else if(ProductCount !== null){
    
                    const cartcount = ProductCount.products.length
                    
    
                    
    
                    res.render('whishlist',{user:userData,cartcount,product,wishlistData,cartItem,cartcount,wishlistCount:0})
                }
                else if(ProductCount1 !== null){
    
                    const wishlistCount = ProductCount1.products.length
    
                   
    
                    res.render('whishlist',{user:userData,product,wishlistData,cartItem,cartcount:0,wishlistCount})
    
                }else{
    
                    res.render('whishlist',{user:userData,cartcount,product,wishlistData,cartItem,wishlistCount,cartcount:0,wishlistCount:0})
                    
                }


            }else{ 
                res.render('whishlist',{user:userData,wishlistData,cartcount:0,wishlistCount:0})
            }

          

            // console.log(ProductCount)
          


            // res.render('whishlist',{user:userData,cartcount,product,wishlistData,wishlistCount,cartItem})


            // console.log(wishlist)


            // console.log(wishlistitem)
            
           
          



            


        }  else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
next(error.message)
    }
}

const increment = async(req,res,next)=>{
    try {
        
        // console.log("hello")
        let id = req.params.productId
        // console.log(id)
        let id1 = req.session.userId
       
        // console.log(req.session)
         let cartData = await Cart.findOne({ user:id1,"produtcs.item":id })
        //  console.log(cartData,"dsadsaa")
        let productData = await addProductModel.findById({_id:id})

        let updateData1 = await Cart.findOne({user:req.session.userId,"products.item": id})
         quantity = updateData1.products[0].quantity
      
        //

        price = productData.price
         stockExist = productData.Instock
         
         

        // console.log(price,"hellosas")
        // console.log("products",productData)
        if (quantity < stockExist ) {
            let id = req.params.productId
        
            let id1 = req.session.userId
            let productData = await addProductModel.findById({_id:id})
            

            let updateData1 = await Cart.findOne({user:req.session.userId,"products.item": id})

             quantity = updateData1.products[0].quantity
           
          
            //
    
        
            let stockExist = productData.Instock
            
             

            let updateData = await Cart.findOneAndUpdate({user:req.session.userId, "products.item": id},
        { $inc:{'products.$.quantity': 1 ,"products.$.pricetotal": +price}}) 

        //  console.log(updateData,"12345")
        // price increased
            cartData = await Cart.findOne({user:req.session.userId,"products.item":id})

            let updatedPrice = cartData.products.find((p) => p.item == id).pricetotal
            //   
            let products = cartData.products
            //  console.log(products,"sadasd")
            let prices = products.map(products => products.pricetotal)

            //  console.log(prices,"dsdfsfds")
            let sum = prices.reduce((sum,num)=> sum + num )

         

           
            //  console.log(sum,"hello")

            res.json({success:"success",updatedPrice,sum,})
            
        } else {
           res.json({success:"failed"})
        }








        
    } catch (error) {
        
        console.log(error.message)
next(error.message)
        
    }
}
// const decrement = async(req,res,next)=>{

//     let id =req.params.productId
//     let cartData = await Cart.findOne

// }

const decrement = async(req,res,next)=> {
    try {

        // console.log("hello  fdsfsdfsd")
         
        let id = req.params.productId
      
        let cartData = await Cart.findOne({ user: req.session.userId, "products.item": id })

        let productData = await addProductModel.findById({_id:id})
        // console.log(cartData,"h2121")
        price = productData.price

        let quantity = cartData.products.find((p) => p.item == id).quantity

        // console.log(quantity,"231312")
        

        if (quantity > 1) {

        const productData = await addProductModel.findById({ _id: id });
            
        let updateData = await Cart.findOneAndUpdate({ user: req.session.userId, "products.item": id },
        { $inc:{'products.$.quantity': -1 ,"products.$.pricetotal":-price}}) 

       cartData = await Cart.findOne({user: req.session.userId,"products.item":id})
            
            let updatedPrice = cartData.products.find((p) => p.item == id).pricetotal
            // console.log(updatedPrice,"11")
            let products = cartData.products
            // console.log(products,"131222")
            let prices = products.map(products => products.pricetotal)
            // console.log(prices,"12231")
            let sum = prices.reduce((sum, num) => sum + num)
            // console.log(sum,"local")
            res.json({updatedPrice,sum})

        } else {
            res.redirect('/wishlist')
        }
        
    } catch (error) {
        console.log(error.message)
next(error.message)
    }
    
}

const deleteWishList = async(req,res,next)=>{
    try {
        
        id=req.query.id
    
    
        const userData= await Customer.findById({_id:req.session.userId})
    
        
        await Wishlist.updateOne({user:ObjectId(userData)},{$pull:{products:{item:req.query.id}}})
    
        res.redirect('/wishlist')
    
    } catch (error) {
    
        console.log(error.message)
next(error.message)
        
    }
    
        
}

const checkout = async(req,res,next)=>{
    try {
        if (req.session.userId) {

           

          
            const userData = await Customer.findById({_id:req.session.userId})

            const address = userData.address
            
            // console.log(address,"helloo")
           

            const cartData = await Cart.findOne({user:ObjectId(userData)})

            

            const cartItem = await cartData.products

     

            const prodata = cartItem.map(n=>n.item)

          

            const product = await addProductModel.find({_id:{$in:prodata}}) 


            const ProductCount = await Cart.findOne({user:ObjectId(userData)})

            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})
            

      
            if(ProductCount !== null && ProductCount1 !== null )
            {
                const cartcount = ProductCount.products.length
                const wishlistCount = ProductCount1.products.length
                
                // console.log("1");
                res.render('checkout',{user:userData,cartcount,product,cartItem,cartcount,wishlistCount,address})
                
            }else if(ProductCount !== null){

                const cartcount = ProductCount.products.length
            

                

                res.render('checkout',{user:userData,cartcount,product,cartItem,cartcount,wishlistCount:0,address})
            }
            else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

 

                res.render('checkout',{user:userData,product,cartItem,cartcount:0,wishlistCount,address})

            }else{

                res.render('checkout',{user:userData,cartcount,product,cartItem,wishlistCount,cartcount:0,wishlistCount:0,address})
             
            }




            


        }  else{
            res.redirect('/login')
        }
    } catch (error) {
        console.log(error.message)
next(error.message)
    }
}
const postCheckOut = async(req,res,next)=>{
    try {
      
        if (req.session.userId) {
            const total = parseInt(req.body.total) 
            const cartData = await Cart.findOne({user:req.session.userId})
            const data = cartData.products
            const country = req.body.country
            const address = req.body.address
            const state = req.body.state
            const postalcode = req.body.postalcode
            const coupen = req.body.coupen
            const wallet = req.body.money
            const totalprice = req.body.totalPrice
    
          

            if(req.body.payment_method == 'Cash on Delivery'){

                let coupenData = await Coupen.findOne({code:coupen})
                if(coupenData){
                   let coupen1 = await Coupen.findOneAndUpdate({code:coupen},{$push:{claimedBy:req.session.userId}})
                }
                let userData = await Customer.findOne({_id:req.session.userId}) 
                if(userData){
                    await Customer.findOneAndUpdate({_id:req.session.userId},{wallet:wallet})
                }           
            
                const timeIn7Days = moment().add(7, 'days');
                const order = new Order({
                    user:req.session.userId,
                   

                   
                    products:data,
                    total:totalprice,
                    payment_method:req.body.checkbox,
                    created_date:moment().format('YYYY-MM-DD HH:mm:ss'),
                    delivery_date:timeIn7Days.format('YYYY-MM-DD'),
                    address:{

                        address:address,
                        country:country,
                        state:state,
                        postalcode:postalcode,
                        fname:req.body.fname,
                        lname:req.body.lname,
                        mobile:req.body.mobile,
                        email:req.body.email,
                        city:req.body.name,


                    }
                })
                const orderData = await order.save()
                 
                const addressexist = await Customer.find({
                    "address.address1": req.body.address,
                    "address.country": req.body.country,
                    "address.state": req.body.state,
                    "address.postalcode": req.body.postalcode,
                    "address.mobile": req.body.mobile,
                    "address.email": req.body.email,
                    "address.city": req.body.city,
                    "address.fname": req.body.fname,
                    "address.lname": req.body.lname,
                  });

    
                    
                    
             
           

            

           

           

                

              
                // console.log("address.$.address1","hyyyyyyy")
                 
                // console.log(req.body,"is everyone ok")
                
  if (addressexist.length === 0) {
    const newAddress = {
      fname: req.body.fname,
      lname: req.body.lname,
      address1: req.body.address,
      postalcode: req.body.postalcode,
      country: req.body.country,
      state: req.body.state,
      mobile: req.body.mobile,
      email: req.body.email,
      city: req.body.city,
    };

    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.session.userId,
      { $push: { address: newAddress } },
      { new: true }
    );
    const productData = await Order.findOne({_id:orderData._id})

    const products = productData.products
    const productItem = products.map(value=>value.item)
    const productQty = products.map(value=>value.quantity)
   
    const ProductDetails = await addProductModel.find({_id:{$in:productItem} })

    let updatedData = [];

    for (let i = 0; i < products.length; i++) {
       
        let updatedStock = ProductDetails[i].Instock - products[i].quantity;
      
       
    }
    for (let i = 0; i < ProductDetails.length; i++) {
        const item = ProductDetails[i]._id;
        const updatedStock = updatedData[i];
        await addProductModel.updateOne(
          { _id: item },
          { $set: { Instock: updatedStock } }
        );
  
        }



       
    res.status(200).json({ success: "Cash on Delivery" });
            }
            else{
                const productData = await Order.findOne({_id:orderData._id})

                const products = productData.products
                const productItem = products.map(value=>value.item)
                const productQty = products.map(value=>value.quantity)
               
                const ProductDetails = await addProductModel.find({_id:{$in:productItem} })
        
                let updatedData = [];
        
                for (let i = 0; i < products.length; i++) {
                   
                    let updatedStock = ProductDetails[i].Instock - products[i].quantity;
                    updatedData.push(updatedStock);
                    // console.log(updatedStock, "updated");
                    // console.log(updatedData)
                   
                }
                for (let i = 0; i < ProductDetails.length; i++) {
                    const item = ProductDetails[i]._id;
                    const updatedStock = updatedData[i];
                    await addProductModel.updateOne(
                      { _id: item },
                      { $set: { Instock: updatedStock } }
                    );
              
                    }
        
        
        
               
                res.json({success:'Cash on Delivery'})

            }

          
                   

                


            }
            else if(req.body.payment_method == 'RazorPay(UPI)'){
               

                const user = await Customer.findByIdAndUpdate({_id:req.session.userId},{wallet:wallet})
                const total = parseInt(req.body.total) 
                const timeIn7Days = moment().add(7, 'days');
                const order = new Order({
                    user:req.session.userId,
                    // created_date:newDate(),
                    products:data,
                    total:total,
                    payment_method:req.body.checkbox,
                    created_date:moment().format('YYYY-MM-DD HH:mm:ss'),
                    delivery_date:timeIn7Days.format('YYYY-MM-DD'),
    
                    address:{
                        firstname:req.body.fname,
                        lastname:req.body.lname,
                        country:req.body.country,
                        address:req.body.address,
                        city:req.body.city,
                        state:req.body.state,
                        postalcode:req.body.postalcode,
                        phone:req.body.phone,
                        email:req.body.name,
                       
    
        
                    }
                    
                })

                const orderData = await order.save()

                //  console.log(orderData,"hello")
                const addressexist = await Customer.find({
                    "address.address1": req.body.address,
                    "address.country": req.body.country,
                    "address.state": req.body.state,
                    "address.postalcode": req.body.postalcode,
                    "address.mobile": req.body.mobile,
                    "address.email": req.body.email,
                    "address.city": req.body.city,
                    "address.fname": req.body.fname,
                    "address.lname": req.body.lname,
                  });

                  if (addressexist.length === 0) {
                    const newAddress = {
                      fname: req.body.fname,
                      lname: req.body.lname,
                      address1: req.body.address,
                      postalcode: req.body.postalcode,
                      country: req.body.country,
                      state: req.body.state,
                      mobile: req.body.mobile,
                      email: req.body.email,
                      city: req.body.city,
                    };
                    const updatedCustomer = await Customer.findByIdAndUpdate(
                        req.session.userId,
                        { $push: { address: newAddress } },
                        { new: true }
                      );
  

    
       
                res.status(200).json({success:'RazorPay(UPI)'});
                }
                    else{
               
                res.json({success:'RazorPay(UPI)'})

                    }
               
        
                
         

             

            }
            else if(req.body.payment_method == 'fullWallet'){
                console.log(req.body.checkbox,"hey there checjkbox")
                const user = await Customer.findOne({_id:req.session.userId})
                console.log(user.wallet)
                const total = parseInt(user.wallet) 
                console.log(total,"this is wallet")
                const timeIn7Days = moment().add(7, 'days');
                const order = new Order({
                    user:req.session.userId,
                    // created_date:newDate(),
                    products:data,
                    total:total,
                    payment_method:req.body.payment_method,
                    created_date:moment().format('YYYY-MM-DD HH:mm:ss'),
                    delivery_date:timeIn7Days.format('YYYY-MM-DD'),
    
                    address:{
                        firstname:req.body.fname,
                        lastname:req.body.lname,
                        country:req.body.country,
                        address:req.body.address,
                        city:req.body.city,
                        state:req.body.state,
                        postalcode:req.body.postalcode,
                        phone:req.body.phone,
                        email:req.body.name,
                       
    
        
                    }
                    
                })
               
                const orderData = await order.save()
             

                //  console.log(orderData,"hello")
                const addressexist = await Customer.find({
                    "address.address1": req.body.address,
                    "address.country": req.body.country,
                    "address.state": req.body.state,
                    "address.postalcode": req.body.postalcode,
                    "address.mobile": req.body.mobile,
                    "address.email": req.body.email,
                    "address.city": req.body.city,
                    "address.fname": req.body.fname,
                    "address.lname": req.body.lname,
                  });

                  if (addressexist.length === 0) {
                    const newAddress = {
                      fname: req.body.fname,
                      lname: req.body.lname,
                      address1: req.body.address,
                      postalcode: req.body.postalcode,
                      country: req.body.country,
                      state: req.body.state,
                      mobile: req.body.mobile,
                      email: req.body.email,
                      city: req.body.city,
                    };
                    const updatedCustomer = await Customer.findByIdAndUpdate(
                        req.session.userId,
                        { $push: { address: newAddress } },
                        { new: true }
                      );
  

    
       
                res.status(200).json({success:'fullWallet'});
                }
                    else{
               
                res.json({success:'fullWallet'})

                    }
               
            }
           

        } else {
            res.redirect('/login')
            
        }

      
           

             
    
            
    
           
            
     
       
        
    } 
    
    catch (error) {
        console.log(error)
        
    }
}
const confirmOrder = async(req,res,next)=>{
    try {
        if (req.session.userId) {

            const user = await Customer.findById({_id:req.session.userId})

             

            // console.log(user,"1221")
            const cartData1 = await Cart.findOne({user:req.session.userId})

           
            const cartData = await Cart.updateMany(
                { user: req.session.userId },
                { $unset: { products: "" } },
                { multi: true }
              );
              

          

            const orderData = await Order.findOne({}).populate('products.item')
                .sort({
                createdAt:-1}).limit(1)

                // console.log(orderData._id,"hey id")
                id = orderData._id
                

            if (orderData.payment_method == "RazorPay(UPI)") {
                const orderData = await Order.findOneAndUpdate({_id:id},{$set:{payment_status:"Recieved"}}).populate('products.item')
                .sort({
                created_date:-1})

                
            }
            else if(orderData.payment_method == "fullWallet"){
                const userData = await Order.findOneAndUpdate({_id:req.session.userId},{wallet:0})
                const orderData = await Order.findOneAndUpdate({_id:id},{$set:{payment_status:"Recieved",}}).populate('products.item')
                .sort({
                created_date:-1})
                
            }
            const orderItem = await orderData.products

            let sum = orderItem.reduce((total, product) => total + product.pricetotal, 0);
            
            let discount = sum - orderData.total
            const prodata = orderItem.map(n=>n.item)
            const products = await addProductModel.find({_id:{$in:prodata}})
            res.render('order-confirm',{products,prodata,orderItem,user,cartData,orderData,sum,discount })

           



           

          

          

            
                


     

          
            
        } else {
            res.redirect('/')
            
        }
        
    } catch (error) {
        console.log(error)
        
    }
}
const viewAddress = async(req,res,next)=>{
    try {
        if(req.session.userId){
            
            const userData = await Customer.findById({_id:req.session.userId})
           
            const ProductCount = await Cart.findOne({user:ObjectId(userData)})


            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})

            const addressData = await Customer.findById({_id:req.session.userId,})

            const address =  addressData.address


            



            if(ProductCount !== null && ProductCount1 !== null )
            {
                    const cartcount = ProductCount.products.length
                    const wishlistCount = ProductCount1.products.length
                    
                    res.render('view-address',{user:userData,cartcount,wishlistCount,address})
                    
                }else if(ProductCount !== null){

                    const cartcount = ProductCount.products.length
                    // console.log("2321321");

                    

                    res.render('view-address',{user:userData,cartcount,wishlistCount:"null ",address})
                }
                else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

                // console.log("332332");

                res.render('view-address',{user:userData,cartcount:"null" ,wishlistCount,address})

            }else{

                res.render('view-address',{user:userData,cartcount:"null" ,wishlistCount:"null",address})
                // console.log("4");
            }
            
 
            
            //  res.render('add-address',{user:userData,cartcount})
            
        }
        else{
            res.redirect('/login')
        }
        
        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}

const deleteAddress = async(req,res,next)=>{
    try {
        id=req.query.id

        // console.log(req.session.userId,"delivered")
      
     const  deleted =  await Customer.findOneAndUpdate({_id:ObjectId(req.session.userId)},{$pull:{address:{_id:id}}})

    //  console.log(deleted,"deleted")

        res.redirect('/view-address')
        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}


   const viewEditAddress = async(req,res,next) =>{
    try {

      

        if (req.session.userId) {

            id = req.query.id

            
                
            const userData = await Customer.findById({_id:req.session.userId})
           
            const ProductCount = await Cart.findOne({user:ObjectId(userData)})


            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})

            const address = await Customer.findOne({_id:req.session.userId,address:{$elemMatch:{ _id: id }}}) 

            address1 = address.address

            // console.log(address1,"heyyy")



            // const addressData = await Customer.findById({_id:req.session.userId,})

         


            



            if(ProductCount !== null && ProductCount1 !== null )
            {
                    const cartcount = ProductCount.products.length
                    const wishlistCount = ProductCount1.products.length
                    
                    res.render('edit-address',{user:userData,cartcount,wishlistCount,address1})
                    
                }else if(ProductCount !== null){

                    const cartcount = ProductCount.products.length
                    // console.log("2321321");

                    

                    res.render('edit-address',{user:userData,cartcount,wishlistCount:0,address1})
                }
                else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

                // console.log("332332");

                res.render('edit-address',{user:userData,cartcount:0,wishlistCount,address1})

            }else{

                res.render('edit-address',{user:userData,cartcount:0,wishlistCount:0,address1})
                // console.log("4");
            }

             
        } else {

            res.redirect('/login')
            
        }
        
    } catch (error) {
        console.log(error)
        
    }
   }






const editAddress = async(req,res,next)=>{
    try {
        if (req.session.userId) {

            id = req.query.id 

            // console.log(id)

         
         
            // const customerdata = await Customer.findById({_id:req.session.userId})
            // console.log(customerdata);
            const userData = await Customer.findOneAndUpdate({_id:req.session.userId,address:{$elemMatch:{ _id: id }}},{$set:{

                "address.$.address1":req.body.address,
                "address.$.postalcode":req.body.postcode,
                "address.$.street":req.body.area,
                "address.$.country":req.body.country,
                "address.$.state":req.body.state,
                "address.$.district":req.body.district

            }})
               
            //     address:{...address2}
            // }})

            res.redirect('/view-address')

            
        } else {
            res.redirect('/')
            
        }

        
    } catch (error) {
        console.log(error)
        
    }
}

const orderList = async (req,res,next)=>{
    try {
        if(req.session.userId){

            const userData = await Customer.findById({_id:req.session.userId})

            const ProductCount = await Cart.findOne({user:ObjectId(userData)})

            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})

            const OrderData = await Order.find({user:req.session.userId}).sort({created_date:-1})
          

           



            


            // console.log(ProductCount)
            if(ProductCount !== null && ProductCount1 !== null )
            {
                    const cartcount = ProductCount.products.length
                    const wishlistCount = ProductCount1.products.length
                    // console.log("1");
                    res.render('order-list',{user:userData,cartcount,wishlistCount,OrderData})
                    
                }else if(ProductCount !== null){

                    const cartcount = ProductCount.products.length
                    // console.log("2321321");

                    

                    res.render('order-list',{user:userData,cartcount,wishlistCount:0,OrderData})
                }
                else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

                // console.log("332332");

                res.render('order-list',{user:userData,cartcount:0,wishlistCount,OrderData})

            }else{

                res.render('order-list',{user:userData,cartcount:0,wishlistCount:0,OrderData})
                // console.log("4");
            }
            
            

            // res.render('edit-profile',{user:userData,cartcount})
            
        }
        else{
            res.redirect('/')
        }

        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}

const viewOrder = async(req,res,next)=>{
    try {

        if(req.session.userId){

            const id = req.query.id

            const orderData = await Order.findById({_id:id}).populate('products.item').sort({created_date:-1})

            const orderProd = orderData.products
            

            prodata = orderProd.map(n=>n.item)

            const productData = await addProductModel.find({_id:{$in:prodata}})


            

            const userData = await Customer.findById({_id:req.session.userId})



            

            const ProductCount = await Cart.findOne({user:ObjectId(userData)})

            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(userData)})




           



            


            // console.log(ProductCount)
            if(ProductCount !== null && ProductCount1 !== null )
            {
                    const cartcount = ProductCount.products.length
                    const wishlistCount = ProductCount1.products.length
                    // console.log("1");
                    res.render('view-order',{user:userData,cartcount,wishlistCount,productData,orderProd,orderData})
                    
                }else if(ProductCount !== null){

                    const cartcount = ProductCount.products.length
                    // console.log("2321321");

                    

                    res.render('view-order',{user:userData,cartcount,wishlistCount:0,productData,orderProd,orderData})
                }
                else if(ProductCount1 !== null){

                const wishlistCount = ProductCount1.products.length

                // console.log("332332");

                res.render('view-order',{user:userData,cartcount:0,wishlistCount,productData,orderProd,orderData})

            }else{

                res.render('view-order',{user:userData,cartcount:0,wishlistCount:0,productData,orderProd,orderData})
                // console.log("4");
            }
            
            

            // res.render('edit-profile',{user:userData,cartcount})
            
        }
        else{
            res.redirect('/')
        }

        
    } catch (error) {
        console.log(error)
    }
}

const cancelOrder = async(req,res,next)=>{
    try {
        
        
        id = req.body.id
        reason = req.body.reason
        
         const orderData = await Order.findOne({_id: id});
         const returnDate = moment(orderData.delivery_date).add(2, 'days').format('YYYY-MM-DD');
        console.log(returnDate,"hey manu")
        const currentDate = moment().format('YYYY-MM-DD');
        console.log(currentDate,"hey mahn")

        // if(orderData.payment_method =="RazorPay(UPI)" && delivery_date < ){
      
    if (orderData.payment_method === "RazorPay(UPI)" || orderData.payment_method ===  "COD"  && orderData.order_status == "delivered" && orderData.payment_status == "Recieved ") {
            let wallet = orderData.total
        const result = await Order.updateOne({_id: id},{ $set:{ order_status: "returned",payment_status:"Refunded",return_reason:reason }  });
        const userWallet = await Customer.findOneAndUpdate({_id:req.session.userId},{$set:{wallet:wallet}})
      


        // Allow product return
    } else if(orderData.payment_method === "RazorPay(UPI)" || orderData.payment_method ==="fullWallet" && orderData.payment_status == "Recieved") {
        const result = await Order.updateOne({_id: id},{ $set:{ order_status: "Cancelled",payment_status:"Refunded",return_reason:reason }  });
        const userWallet = await Customer.findOneAndUpdate({_id:req.session.userId},{$set:{wallet:wallet}})
        
        // Do not allow product return
    }else if(orderData.payment_method === "COD"){
        const result = await Order.updateOne({_id: id},{ $set:{ order_status: "Cancelled",cancel_reason:reason }  });
    }

        
     
     
        
        
        
        // console.log(result,"hey kamuki")
        res.redirect('/order-list')


        

        
       

        // // const orderData = await Order.findByIdAndUpdate({_id:id},{order_status:"Cancelled"})



        //  res.redirect('/order-list')


        
    } catch (error) {

        console.log(error.message)
next(error.message)
        
    }
}
const checkoutPayment = async(amount) =>{
    try {
      
        const options = {
            amount: amount*100,  // amount in the smallest currency unit
            currency: "INR",
           
           
          };

        //   console.log(instance,"this is instance")

          const order =  await instance.orders.create(options);
        //   console.log(order,"this is order")

          return order
          
        
    } catch (error) {
        
        console.log(error)
        
    }
}
const loadamount = async(req,res,next)=>{
   try {
    const { amount } = req.body
    // console.log(req.body.total,"hello")
    const order = await checkoutPayment(amount)
    // console.log(order.total,"hiii")
    res.json({orderId:order.id,})

    
   } catch (error) {
    console.log(error.message)
next(error.message)
    
   }

}

const postPay = async(req,res,next)=>{
    try {
       
        let serverOrder = req.body.orderId
        let razorOrder = req.body.razorOrderid
        let payid = req.body.payid
        let signature = req.body.signature

        // keysecret = "spL8HkAe4YmyGESpTczxLBPz"
        keysecret = process.env.RAZORPAY_APT_SECRET

        const hmac_sha256 = (data,secret)=> {
            return crypto.createHmac('sha256',secret).update(data).digest('hex');
        }
     let  generated_signature = hmac_sha256(serverOrder + "|" + payid, keysecret);
     console.log(generated_signature,"generated")

     if(generated_signature == signature){
     
        res.json({message:'payment successfull'})
        const orderData = await Order.findOne({}).sort({
            created_date:-1}).limit(1)


        const updateData = await Order.findByIdAndUpdate({_id:orderData._id},{$set:{payment_method:"RazorPay(UPI)"}})
        const productData = await Order.findOne({_id:orderData._id})

        const products = productData.products
        const productItem = products.map(value=>value.item)
        const productQty = products.map(value=>value.quantity)
       
        const ProductDetails = await addProductModel.find({_id:{$in:productItem} })

        let updatedData = [];

        for (let i = 0; i < products.length; i++) {
            // console.log(products[i].quantity, ProductDetails[i].Instock, "2 worked");
            let updatedStock = ProductDetails[i].Instock - products[i].quantity;
            updatedData.push(updatedStock);
         
           
        }
        for (let i = 0; i < ProductDetails.length; i++) {
            const item = ProductDetails[i]._id;
            const updatedStock = updatedData[i];
            await addProductModel.updateOne(
              { _id: item },
              { $set: { Instock: updatedStock } }
            );
      
            }







      
 
       
  
       
    

    
     }

        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}


const sortH = async(req,res,next)=>{
    try {
       
        const productData = await addProductModel.find({__v:0}).sort({price:1})
        res.json({product:productData})
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}
const sortL = async(req,res,next)=>{
    try {
        const productData = await addProductModel.find({__v:0}).sort({price:-1})
        res.json({product:productData})
    } catch (error) {
        console.log(error)
        next(error.message)
        
    }
}

const checkCoupen = async(req,res,next)=>{
    try {
       const coupen = req.body.COUPEN
        let  total = req.body.total
     

       coupenData = await Coupen.findOne({code:coupen})
       console.log(coupenData,"hey hello")

       coupenData1 = await Coupen.findOne({code:coupen,claimedBy:{ $in: [req.session.userId] } });
       console.log(coupenData1,"this is coupen data")

        if (coupenData1) {
            res.json({success:"Already Used"})
            
        } else {

            if (coupenData) {
                maxRedeem = coupenData.maxRedeemAmount
                minPurchase = coupenData.minPurchaseAmount
                discount = coupenData.discount
                total = req.body.total
                
               
                 if(coupenData.expiry_date > coupenData.created_date){
                    
                if (total>minPurchase) {
               
                    const dicountAmount = (discount / 100 )*total;
   
                   
                   // console.log(dicountAmount,"hey discount amount")
   
                   if(dicountAmount > maxRedeem ){
                       res.json({success:"cannot apply"})
       
   
   
                   }else{
                       const dicountAmount = (discount / 100 )*total;
                       discountTotal = total - dicountAmount
                       // console.log(discountTotal,"this is discountTotal")
                       
   
                       res.json({success:"success",dicountAmount,discountTotal})
                       
                   }
                   
                 
               
               } else {
                   res.json({success:"minimum",minPurchase})
               
                }
                 }else{
                    res.json({success:"expiry"})
                }
     
                  
                
     
             
            } else {
                 res.json({success:"failed"})
             
            }
            
        }
         
        
      
   
    } catch (error) {
        console.log(error)
        
    }
}




const returnReason = async(req,res,next)=>{
    try {
       const reason = req.body.reason
       const id = req.body.id
     
       res.redirect('/order-list')
        
        
    } catch (error) {
        console.log(error.message)
next(error.message)
        
    }
}

const sortH1 = async(req,res,next)=>{
    try {
        
        id = req.query.value
        console.log(id)
        const productData = await addProductModel.find({ category: { $in: [id] } }).sort({ price: 1 });

     

        res.json({product:productData})
       
        
    } catch (error) {
        console.log(error.message)
        next(error.message)
        
    }
}
const sortL1 = async(req,res,next)=>{
    try {
        
        id = req.query.value
        console.log(id)
        const productData = await addProductModel.find({ category: { $in: [id] } }).sort({ price: -1 });

        

        res.json({product:productData})
       
        
    } catch (error) {
        console.log(error.message)
        next(error.message)
        
    }
}
const search1 = async (req, res) => {
    try {
      let page = parseInt(req.body.page) || 1;
      let searchQuery = req.body.search || '';
      let categoryIds = req.body.category || null;
      let sortOption = req.body.sort || '';
  
      const query = {
        $or: [
          { name: { $regex: "." + searchQuery + ".", $options: "i" } },
         
        ],
      };
  
      if (categoryIds && categoryIds.length > 0) {
        query.category = { $in: categoryIds };
      }
  
      let sort = {};
  
      switch (sortOption) {
        case 'Low to high':
          sort = { price: 1 };
          break;
        case 'High to low':
          sort = { price: -1 };
          break;
      }
        const limit = 6;
      const products = await addProductModel.find(query)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .exec();

      console.log(products) 
  
      const count = await addProductModel.countDocuments(query);
  
      const totalPages = Math.ceil(count / limit);
  
      res.json({
        product: products,
        currentPage: page,
        totalPages: totalPages,
      });
    } catch (error) {
        console.log(error.message)
        
    }
  };
  


        


       

        

















module.exports = {
    loadRegister,
    insertUSer,
    verifyLogin, loadHome,
    verifyMail, insertOtp, confirmLoadOtp,
    verifyOtp,
    forgetVerify, loadForgetPassword,
    forgetPasswordLoad, userLogout,
    resetPassword,
    viewProduct,resendOtp,
    login,shop,logout,
    viewProfile,
    Address,addAddress,userProfile,editProfile,
    addCart,viewCart,deleteItem,addWhishList,loadWhishList,increment,decrement,
    deleteWishList,checkout,postCheckOut,confirmOrder,viewAddress,deleteAddress,editAddress,viewEditAddress,orderList,
    viewOrder,cancelOrder,checkoutPayment,loadamount,postPay,sortH,sortL,checkCoupen,returnReason,sortH1,sortL1,search1

    

}