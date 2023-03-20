
require('dotenv').config()
const mongoose = require('mongoose')
mongoose.connect(process.env.MONGODB)


const express = require("express")
const app = express();
const path = require('path')
app.use((req,res,next)=>{
    res.set('cache-control','no-store')
    next()
})
app.set('view engine','ejs');
app.use(express.static(path.join(__dirname, "/public")));              
app.use(express.static(path.join(__dirname, "/js")));

//for user routes
const userRoute =  require('./routes/userRoute');
const { dirname } = require('path');
app.use('/',userRoute)


const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)

app.use((req,res,next)=>{
    const error = new Error('Page Not Found')
    error.status = 404
    next(error)
})
 // handle error 
 app.use((error,req,res,next) =>{
    if(error.status === 404 ){
        res.status(404).render('404',{errorMesssage: error})
    }else{
        res.status(500).render('500',{errorMesssage: error})
    }
 })



app.listen(3000,function(){
    console.log("E-mart is running");
})