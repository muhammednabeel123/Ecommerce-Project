const { ObjectID, ObjectId, Timestamp } = require('bson')
const mongoose = require('mongoose')
const moment = require('moment');
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


const orderSchema = mongoose.Schema({

    created_date:{
        type: String,
        
       
    },
    


  
    
    delivery_date:{
        type: String,
        
       
    },
    
    user:{
        type:Schema.Types.ObjectId,
        ref:'Customer',
        required:false
    },
    products:[productschema],
    
    total:{
        type:Number,
        required:false
    },
    address:Array,
    payment_method:{
        type:String,
        required:false,
        default:'COD'
    },
    payment_status:{
        type: String,
        required: true,
        default:'pending'
    },
    order_status:{
        type:String,
        required:false,
        default:'pending'
    },
    return_reason:{
        type:String

    },
    cancel_reason:{
        type:String

    }

},
{timestamps:true})

module.exports = mongoose.model('Order',orderSchema)