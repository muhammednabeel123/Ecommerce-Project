const isLogin = async(req,res,next)=>{  
    try {
        if(req.session.userId){
            
           
         
        }
        else{
            res.redirect('/')
            
        }
        
        
    } catch (error) {
        console.log(error.message)
        
    }
}
const isLogout =  async(req,res,next) =>{
    try {

        if (req.session.userId) {
            res.redirect('/')
            console.log('hello')

        } else {
            next();
        }


    }
    catch(error){
        console.log(error.message)
    }
}

module.exports = {
    isLogout,
    isLogin
}