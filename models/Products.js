const mongoose = require('mongoose')
const Schema = mongoose.Schema
const productSchema = mongoose.Schema({
    name:{
        type:String,
        
    },
    price:{
        type:Number,
       

    },
    grossprice:{
        type:String

    },
    description:{
        type:String,
       
    },
    category:{
        type:Schema.Types.ObjectId,
        ref: "Category",
        required : true
       
    },
    Image:{
        type:Array,
       
    },
    Instock:{
        type:Number,
       

    }
    


})
module.exports = mongoose.model('Products',productSchema)