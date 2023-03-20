const { Message } = require('twilio/lib/twiml/MessagingResponse');
const { findById } = require('../models/Products');
const addProductModel =  require('../models/Products')
const addCategoryModel =  require('../models/category')

const addproduct =  async(req,res,next) =>{
    try {
        const categoryData = await addCategoryModel.find({__v:0})



        res.render('add-product',{categories:categoryData})
        console.log(categories);


    } catch (error) {
        console.log(error.message)
        
    }
}
  




const insertProduct = async(req,res,next) => {
    try {

        // console.log(req.files);
        let files = []
        const imageUpload = await (function(){
            for(let i=0;i<req.files.length;i++){
                files = req.files[i].filename
            }
            return files
        })()
        const addProduct = new addProductModel({
            name:req.body.productname,
            price:req.body.price,
            grossprice:req.body.grossprice,
            description:req.body.description,
            category:req.body.category,
            Image:imageUpload,
            Instock:req.body.stock

        })
        const productData =  await addProduct.save();
        if (productData) {
            res.redirect('/admin/products')
            
        } else {
            res.render('add-product',{message:"Something error"})
            
        }


        
    } catch (error) {
        console.log(error.message)
    }


}
const deleteProduct = async(req,res,next)=>{
    try {
        const id = req.query.id;
        await addProductModel.deleteOne({_id:id})
        res.redirect('/admin/products')


        
    } catch (error) {
        console.log(error.message)
        
    }
}
const editProduct = async(req,res,next)=>{

    try {
        const id = req.query.id
       const products =  await addProductModel.findById({_id:id})
       const productData = await addProductModel.findOne({_id:id}).populate('category')
    
        const categories = await addCategoryModel.find({__v:0})
       if(productData){
        res.render('edit-product',{ products,productData,categories })

       }
       else{

       }

        
    } catch (error) {
        console.log(error.message)
        
    }
}

const viewProduct = async(req,res,next) =>{
    try {
        const id = req.query.id
        const productData =  await addProductModel.findById({_id:id})
        res.render('viewprod',{ product:productData })
        
    } catch (error) {
        console.log(error.message); 
        next(error.message)
    }
  


}



const updateProduct = async(req,res,next)=>{
    try {
        
        if(req.files){ 

                let files =[]
                for(let i=0;i<req.files.length;i++){
                    files = req.files[i].filename
                    
                }
       
    
            const image = await  addProductModel.findByIdAndUpdate({_id:req.body.id},{$push:{Image:files}})
            // console.log(image,"heuyy")
            const update = await addProductModel.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.productname,description:req.body.description,price:req.body.price,Instock:req.body.stock,category:req.body.category}})
            res.redirect('/admin/products')

       }
        else{
            console.log("hello else");
            const update = await addProductModel.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.productname,description:req.body.description,price:req.body.price,Instock:req.body.stock,category:req.body.category}})
          
        res.redirect('/admin/products')
        }

   
        
    } catch (error) {
        console.log(error.message); 
        next (error.message)
    }

}




module.exports={
    insertProduct,
    addproduct,
    deleteProduct,
    editProduct,
    updateProduct,
    viewProduct

}