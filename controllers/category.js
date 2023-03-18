const Product = require('../models/Products')
const adminModel = require('../models/adminModel')
const addCategoryModel =  require('../models/category')
const Customer = require('../models/userModel')
const Cart = require('../models/cart')
const Wishlist = require('../models/whishlist');
const { ObjectId } = require('mongodb')



const loadcategory = async(req,res)=>{

    try {
        res.render('add-category')

        
    } catch (error) {
        console.log(error.message)
        
    }


}
const deleteCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        await addCategoryModel.deleteOne({_id:id})
        res.redirect('/admin/category')


        
    } catch (error) {
        console.log(error.message)
        
    }
}
const updateCategory = async(req,res)=>{
    try {
        const id = req.query.id;
        const categoryData =  await addCategoryModel.findById({_id:id})
       

        if(categoryData){
            res.render('category-edit',{ category:categoryData })
    
           }
           else{
    
           }
    
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const categoryEdit = async(req,res)=>{
    try {
       
        if(req.file){ 
            const updatedCategoryData = await addCategoryModel.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.productname,Image:req.file.filename}})
            console.log(updatedCategoryData)
        }else{
            const updatedCategoryData = await addCategoryModel.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.productname}})
            console.log(updatedCategoryData)

        }

        res.redirect('/admin/category')
        
    } catch (error) {
        console.log(error.message);
        
    }
 }






const insertCategory = async(req,res)=>{
    try {
        console.log(req.body)
      
        const categoryexist = await addCategoryModel.find({ name: req.body.categoryname })

      if (!categoryexist.length) {
        const addcategory = new addCategoryModel({
            name:req.body.categoryname,
            Image:req.file.filename
        
        
        
        
        })
            const categoryData = await addcategory.save();
            if(categoryData){
                res.render('add-category',{message:"Data added"})

            }
            else{
                res.render('add-category',{message:"something error"})

            }
        
      } else {
        res.render('add-category',{message:"category already exist"})
        
      }


             
        
    } catch (error) {
        console.log(error.message)
        
    }
    
}

//user - section

const category =  async(req,res)=>{
    try {
        if ( req.session.userId) {

            const id = req.session.userId

            console.log(id)

            const user = await Customer.findById({_id:req.session.userId})

            const categoryData = await addCategoryModel.find({})

            const productData3 = await Product.find({})

       
            const id1 =   req.query.id;
       
        

        

             const category =  await addCategoryModel.findById({_id:id1})

            console.log(category)

        

    

            const productData = await Product.find({category:{$in:category} })

        // const ProductCount = await Cart.findOne({user:userData._id})
            
        // const cartcount = ProductCount.products.length
             console.log("dfjkashdfkjasd")

             const ProductCount = await Cart.findOne({user:ObjectId(user)})
            console.log("12312312")
            const ProductCount1 = await  Wishlist.findOne({user:ObjectId(user)})
            console.log("2312312")

        // console.log(ProductCount)
            if(ProductCount !== null && ProductCount1 !== null )
         {
                const cartcount = ProductCount.products.length
                const wishlistCount = ProductCount1.products.length
                // console.log("1");
                res.render('shop-category',{user,products:productData3,category:categoryData,product:productData,categorys:category,cartcount,wishlistCount})
                
             }else if(ProductCount !== null){

                 const cartcount = ProductCount.products.length
                // console.log("2321321");

                

                    res.render('shop-category',{user,products:productData3,category:categoryData,product:productData,categorys:category,cartcount,wishlistCount:"null "})
             }
             else if(ProductCount1 !== null){

             const wishlistCount = ProductCount1.products.length

            // console.log("332332");

            res.render('shop-category',{user,products:productData3,category:categoryData,product:productData,categorys:category,cartcount:"null" ,wishlistCount})

        }else{

            res.render('shop-category',{user,products:productData3,category:categoryData,product:productData,categorys:category,cartcount:"null" ,wishlistCount:"null"})
            // console.log("4");
        }

        // res.render('shop-category',{products:productData3,category:categoryData,product:productData,categorys:category,user:userData,cartcount})

        console.log(productData)
            
        } 
        else {
            const id1 = req.session.userId

            const userData = ""

            const categoryData = await addCategoryModel.find({})

        const productData1 = await Product.find({})

       
        const id =   req.query.id;
       
        

        

        const category =  await addCategoryModel.findById({_id:id})

        console.log(category)

        

    

        const productData = await Product.find({category:{$in:category} })

        let cartcount = null

        res.render('shop-category',{products:productData1,category:categoryData,product:productData,categorys:category,user:userData,cartcount,wishlistCount:"null"})

        console.log(productData)

        }
        
        




      
        
    } catch (error) {
        console.log(error.message)
        
    }
}


module.exports = {
    insertCategory,
    loadcategory,
    deleteCategory,
    categoryEdit,
    updateCategory,
    category

}