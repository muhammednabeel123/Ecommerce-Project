
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
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.static(path.join(__dirname, "/js")));

//for user routes
const userRoute =  require('./routes/userRoute');
const { dirname } = require('path');
app.use('/',userRoute)


const adminRoute = require('./routes/adminRoute')
app.use('/admin',adminRoute)



app.listen(3005,function(){
    console.log("E-mart is running");
})