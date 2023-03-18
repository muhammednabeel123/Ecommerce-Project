const mongoose = require('mongoose')
const Product = require('../models/Products')
const Schema = mongoose.Schema

const productschema = mongoose.Schema({
    item:{
        type:Schema.Types.ObjectId,
        ref:"Products",
        req:true
    },
    quantity:{
        type:Number,
        req:true
    },
    pricetotal:{
        type:Number,
        req:true
    }
})

const categorySchema = mongoose.Schema({

    user:{
        type: Schema.Types.ObjectId,
        ref: "User",
        required:true
    },
    products:[productschema]
    
})

module.exports = mongoose.model('Cart',categorySchema)