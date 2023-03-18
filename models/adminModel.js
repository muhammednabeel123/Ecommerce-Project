const mongoose = require("mongoose");
const adminSchema = mongoose.Schema({
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
    }

})
module.exports = mongoose.model('Admin',adminSchema)
