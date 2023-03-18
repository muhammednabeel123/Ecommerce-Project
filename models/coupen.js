const mongoose = require("mongoose")
const coupenSchema = new mongoose.Schema({
    code:{
        type:String,
        required: true
    },
    discount:{
        type:Number,
        required:true
    },
    isActive:{
        type:Number,
        default:0
      
    },
    maxRedeemAmount:{
        type:Number,
        required:true,
    },
    minPurchaseAmount:{
        type:Number,
        required:true
    },
    claimedBy: {
        type: [mongoose.Schema.Types.ObjectId],
        ref:'Customer',
        default:[]
    },
    expiry_date:{
        type:String,
      

    },
    created_date:{
        type:String,
       
    }
},{timestamps:true})
module.exports = mongoose.model('Coupen',coupenSchema)