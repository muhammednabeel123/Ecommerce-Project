const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({

    address1:{
        type:String,
        required:true

    },
    country:{
        type:String,
        required:true

    },
    state:{
        type:String,
        required:true

    },
    district:{
        type:String,
        required:true

    }, street:{
        type:String,
        

    }, postalcode:{
        type:Number,
        required:true

    },fname:{
        type:String,
        required:true
    },lname:{
        type:String,
        required:true
    },mobile:{
        type:Number,
        required:true
    },email:{
        type:String,
        required:true

    },
    city:{
        type:String,
        required:true

    }



})
const userSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    Image:{
        type:String,
     
    },
    password:{
        type:String,
        required:true
    },
    address:
        [AddressSchema]
       

    ,
    is_admin:{
        type:Number,
      
    },
    is_verfied:{
        type:Number,
        default:0

    },
    token:{
        type:String,
        default:''
    },
    wallet:{
        type:Number,
        default:0

    }


});
module.exports = mongoose.model('Customer',userSchema)

