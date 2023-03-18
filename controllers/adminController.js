const { UserBindingContextImpl } = require('twilio/lib/rest/chat/v2/service/user/userBinding')
const addProducts = require('../models/Products')
const adminModel = require('../models/adminModel')
const addCategoryModel =  require('../models/category')
const Customer = require('../models/userModel')
const Order = require('../models/order')
const Coupen = require('../models/coupen')
const Banner = require('../models/banner')
const { findByIdAndDelete, findByIdAndUpdate, findOneAndUpdate } = require('../models/userModel')
const { report } = require('../routes/adminRoute')
const excelJS = require('exceljs')
const moment = require('moment');





const loadRegister = async(req,res)=>{
    try {

        res.render('adminreg')

        
    } catch (error) {
        console.log(error.message)
    }
}


const insertUSer  = async(req,res)=>{
    try {
        const admin = adminModel({
            name:req.body.name, 
            email:req.body.email,
            mobile:req.body.mno,
            password:req.body.password,




        })
        const userData = await admin.save();
        if(userData){
            res.render('adminreg')
        }
        
    } catch (error) {
        console.log(error.message)
        
    }
}


const loadLogin = async (req,res) => {
    try {
       
            res.render('adminlogin')
        
            

    } catch (error) {
        console.log(error.message)
    }
}
const verifyLogin = async(req,res)=>{
    try {
        const email = req.body.email
        const password = req.body.password;
         const userData = await adminModel.findOne({email:email})
         if(userData){
            const passwordMatch = await password === userData.password
            if (passwordMatch) {
                req.session.admin_id = userData._id;
                res.redirect("/admin/home")

                
            } else {
                res.render('adminlogin',{message:"Email or password is incorrect"})
                
            }
         }
         
         
         else{
            res.render('adminlogin',{message:"Email and password is incorrect"})
         }

        
    } catch (error) {
        
    }
}



const loadDashBoard = async(req,res) =>{
    try {
        
        const orderData = await Order.find({}).sort({createdAt:-1}).populate("products.item")
        const categoryWise = await Order.aggregate([{
            $match: { order_status: "delivered" } // filter only the delivered orders
        },
        { $unwind: "$products" }, // unwind the products array
        {
            $lookup: { // join with the products collection to get the category of each product
                from: "products",
                localField: "products.item",
                foreignField: "_id",
                as: "product"
            }
        },
        { $unwind: "$product" }, // unwind the product array
        {
            $group: { // group by category and sum the total sale amount
                _id: "$product.category",
                totalSale: { $sum: "$product.price" }
            }
        },
        { $sort: { "_id": 1 } } // sort by category name in ascending order
    ]);
    console.log(categoryWise,"this is category")
    

// Get the start and end date of the current week


const moment = require('moment');

// Calculate the start and end dates for the last 7 days
const startOfWeek = moment().startOf('week').format('YYYY-MM-DD');
const endOfWeek = moment().endOf('week').format('YYYY-MM-DD');
console.log(startOfWeek);
console.log(moment(startOfWeek).toDate());

// Find the orders with status "delivered" and delivery date within the last 7 days
const orders = await Order.aggregate([
    {
      $match: {
        order_status: "delivered",
        createdAt: {
          $gte:moment(startOfWeek).toDate(),
          $lte:moment(endOfWeek).toDate()
        }
      }
    },
    { $unwind: "$products" },
  {
    $lookup: {
      from: "products",
      localField: "products.item",
      foreignField: "_id",
      as: "product"
    }
  },
  { $unwind: "$product" },
  {
    $group: {
      _id: { category: "$product.category", dayOfWeek: { $dayOfWeek: "$createdAt" } },
      totalSale: { $sum: { $multiply: ["$products.quantity", "$product.price"] } }
    }
  },
  {
    $project: {
      _id: 0,
      category: "$_id.category",
      dayOfWeek: "$_id.dayOfWeek",
      totalSale: 1
    }
  },
  { $sort: { category: 1, dayOfWeek: 1 } }
]);

    








console.log(orders,"this order");


    const lineChart = orders.map(order=>order.totalSale)
    const day = orders.map(order=>order.dayOfWeek)
    console.log(day,lineChart)
    const pieChart = categoryWise.map(category => category.totalSale);
        res.render('adminhome',{orderData,pieChart,lineChart,day})
        
    } catch (error) {
        console.log(error.message)
        
    }
} 


const loadproduct = async(req,res) =>{
    try {
        const productModel = await addProducts.find({__v:0})
        const category = await addCategoryModel.find({},{_id:1})
        const categoryValue = category.map(category=>category.id)
        const productData = await addProducts.find({category:{$in:categoryValue} }).populate('category')
        const categoryModel = await addCategoryModel.find({__v:0})
        res.render('products',{product:productData,category:categoryModel})
    } catch (error) {
        console.log(error.message)
        
    }
}
    
        
      



       

        


const loadUser = async(req,res) =>{
    try {
        const userData = await Customer.find({__v:0});

        const categories = await addCategoryModel.find({__v:0});

        if(userData){
            res.render('users',{user:userData,categories})

        }




        res.render('users')
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const userBlock = async(req,res) => {
    try {
        const id = req.query.id;
    
        const userData = await Customer.findById({_id:id})
      

       if(userData.is_verfied === 1){
        await Customer.findByIdAndUpdate({_id:id},{$set:{is_verfied:0}})
        res.redirect('/admin/users')
       }
       else if(userData.is_verfied === 0){
        await Customer.findByIdAndUpdate({_id:id},{$set:{is_verfied:1}})
        res.redirect('/admin/users')

       }
      

        
    }catch(error){
        console.log(error.message)
    }
}

const logout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin');
    }
    catch(error){
        console.log(error.message);
    }
}

const viewOrder = async(req,res)=>{
    try {

        const orderData = await Order.find({}).sort({createdAt:-1})
        res.render('admin-orders',{orderData})
        
    } catch (error) {
        console.log(error)
        
    }
}




  

const order = async(req,res)=>{
    try {

      id=req.query.id
      const orderData = await Order.findById({_id:id}).populate('user')
      
      const orderprod = orderData.products
      const orderProducts = orderprod.map(n => n.item)

      const products = await addProducts.find({_id:{$in:orderProducts}})
      res.render('edit-order',{orderData,products})
        
    } catch (error) {
        console.log(error)
        
    }
}

    

    

     


const updateOrder = async(req,res) =>{
    // console.log(req.body,"hello")
    const orderData = await Order.findByIdAndUpdate({_id:req.body.id},{$set:{payment_status:req.body.payment_status,order_status:req.body.order_status}})
    res.redirect('/admin/orders')
}

const coupen = async(req,res)=>{
    try {
        res.render('add-coupen')
        
    } catch (error) {
        console.log(error)
        
    }
}
const addCoupen = async(req,res)=>{
    try {

       
        const timeIn2Days = moment().add(2, 'days').format('YYYY-MM-DD');

        const coupen = new Coupen({
            code:req.body.code,
            discount:req.body.discount,
            maxRedeemAmount:req.body.maxamount,
            minPurchaseAmount:req.body.minpurchase,
            created_date:moment().format('YYYY-MM-DD'),
            expiry_date:timeIn2Days
        



        })

        await coupen.save()

        res.redirect('/admin/view-coupen')


        
    } catch (error) {
        console.log(error.message)
        
    }
}

const viewCoupen = async(req,res)=>{
    try {
        coupanData = await Coupen.find({})
         res.render('view-coupen',coupanData)
        
    } catch (error) {
        console.log(error)
        
    }
}

const loadCategory = async(req,res)=>{
    try {
        const categoryModel = await addCategoryModel.find({__v:0})
        res.render('category',{category:categoryModel})

        
        
    } catch (error) {
        console.log(error)
        
    }
}

const deleteCoupen = async(req,res)=>{
    try {
        id= req.query.id
      
        const coupen = await Coupen.findByIdAndDelete({_id:id})
        res.redirect('/admin/view-coupen')
        
    } catch (error) {
        console.log(error)
        
    }
}

const loadBanner = async(req,res)=>{
    try {
        const bannerData = await Banner.find({})
        res.render('banner',{bannerData})
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const addBanner = async(req,res)=>{
    try {
        const bannerData = await Banner.find({})
        res.render('add-banner',{bannerData})
        
    } catch (error) {
        console.log(error)
        
    }
}

const editBanner = async(req,res)=>{
    try {
       
        const  bannerexist = await Banner.find({name:req.body.bannername})
       
        if (!bannerexist.length) {
            const addbanner = new Banner({
                name:req.body.bannername,
                description:req.body.bannername,
                Image:req.file.filename
            
            })
            const bannerData = await addbanner.save()
            if(bannerData){
                res.redirect('/admin/banner')
            }
            else{
                res.render('add-banner',{message:"something error"})
            }
            
        } else {
            res.render('add-banner',{message:"banner already exist"})
            
        }


        
    } catch (error) {
        console.log(error.message)
        
    }
}

const deleteBanner = async(req,res)=>{
    try {
        id= req.query.id
        // console.log(id,"this is id ")
        await Banner.findByIdAndDelete({_id:id})
        res.redirect('/admin/banner')
        
    } catch (error) {
        console.log(error)
        
    }
}

const deleteImage = async(req,res)=>{
    try {
    
        id = req.query.id
       
        const Image = await addProducts.updateMany({
            Image: {
                $elemMatch: {
                  $eq:id
                }
              }
            },
            {
              $pull: {
                Image:id
              }
            })

            res.redirect('/edit-product')
        // console.log(Image,"i have founded")
        
    } catch (error) {
        console.log(error.message)
        
    }
}

const loadSales = async(req,res)=>{
    try {
       let report = await Order.find({payment_status: "Recieved"}).populate("products.item").sort({created_date:-1})
         let total =  report.map(report => report.total)
       

                let totalprice = total.reduce((totalprice,num)=> totalprice + num )
                
        res.render('sales',{report,totalprice})
        
    } catch (error) {
        console.log(error.message)
        
        
    }
}

const salesReport = async(req,res)=>{
    try {
        const from = req.body.from;
        const to = req.body.to;
        console.log(from,to,"you got wat you need")
        
        if (to > from) {
           let report = await Order.find({created_date:{$gte:from,$lte:to}, payment_status: "Recieved"})
           
            
            if (report.length > 0) {
                const total = report.map(report => report.total);
                const totalprice = total.reduce((totalprice, num) => totalprice + num);
                res.json({success:"sales",report,totalprice})
            } else {
                const totalprice = 0;
                const report = 0;
                res.json({report, totalprice, message: "no sales on this day"});
            }
        } else {
            throw new Error("Invalid date range");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
}
//expost sales data

const exportSales = async(req,res)=>{
    try {

        
      const workbook = new excelJS.Workbook()
      const worksheet = workbook.addWorksheet('sales');
        worksheet.columns = [
        {header:"S.no",key:"s_no."},
        {header:"_id",key:"_id"},
        {header:"payment",key:"payment_status"},
        {header:"payment_method",key:"payment_method"},
        {header:"payment_method",key:"payment_method"},
        {header:"order_date",key:"created_date"},
        {header:"total",key:"total"},

      ]
      let counter = 1





    //   const orderdata = await Order.find({})
            const from = req.body.from
            const to = req.body.to
            console.log(from,"this is from")
            console.log(to,"this is to")
           

            if(to > from ){
                let report = await Order.find({created_date:{$gte:from,$lte:to}, payment_status: "Recieved"})
               

                if(report.length>0){
                    let total =  report.map(report => report.total)
       

                    let totalprice = total.reduce((totalprice,num)=> totalprice + num )
                   
                    report.forEach((order)=>{
                        order.s_no = counter;
                
                        worksheet.addRow(order);
                        counter++
                    })
                    worksheet.getRow(1).eachCell((cell)=>{
                        cell.font = { bold:true}
                    })
                  
                   
                
                    res.setHeader(
                        "Content-Type",
                        "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
                    );
                    res.setHeader("Content-Disposition",`attachment; filename=sales.xlsx`);
                    return workbook.xlsx.write(res).then(()=>{
                      
                        res.status(200);

                    })
                }else{
                    let totalprice = 0
                    let report = 0

                    res.render('sales',{report,totalprice,message:"no sales on this day"})

                }
            }
            else{
                console.log('hey adihiaa')
            }
        } catch (error) {
            console.log(error.message)
            
        }
    
    }

    const editCoupen = async(req,res) =>{
        try {
           id = req.query.id
        
           let  coupenData = await Coupen.findById({_id:id})
           
            res.render('edit-coupen',{coupenData})
            
        } catch (error) {
            console.log(error.message)
            
        }
    }

    const postCoupen = async(req,res)=>{
        try {
            const coupenData = await Coupen.findByIdAndUpdate({_id:req.body.coupen_id},{$set:{
                code:req.body.name,
                maxRedeemAmount:req.body.max,
                minPurchaseAmount:req.body.min
            }})
          
            res.redirect('/admin/view-coupen')
            
        } catch (error) {
            console.log(error.message)
            
        }
    }
    
                
                
            
                            
            
                           
            

                
      
               

              

              
                
          
        

     
    




        

    

        
  














module.exports = {
    loadLogin,
    loadRegister,
    insertUSer,
    verifyLogin,
    loadDashBoard,
    loadproduct,
    loadUser,
    userBlock,
    logout,
    viewOrder,order,updateOrder,coupen,addCoupen,viewCoupen,loadCategory,deleteCoupen,addBanner
    ,loadBanner,editBanner,deleteBanner,deleteImage,loadSales,salesReport,exportSales,editCoupen,postCoupen
  
}