const mongoose = require('mongoose')
const bannerSchema = mongoose.Schema({
    name:{
        type:String,
        req:true
    },
    description:{
        type:String,
        req:true
    },
    Image:{
        type:String,
        req:true
    }
    

})
module.exports = mongoose.model('Banner',bannerSchema )
