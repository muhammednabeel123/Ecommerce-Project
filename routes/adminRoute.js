const express = require("express")
const admin_route = express();

 const session = require('express-session')
// const config = require("../config/config")

const bodyParser = require("body-parser")
// const auth = require("../middleware/adminAuth")

const path = require("path")

const auth = require("../middleware/adminAuth")

const multer = require('multer');

const storage = multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/productimage'))

    },
    filename:function(req,file,cb){
        const name = Date.now()+'-'+file.orginalname
        cb(null,name)
        

    }

})

const upload = multer({storage:storage})

const adminController = require("../controllers/adminController")

const addproductController = require("../controllers/product")

const addcategoryController = require("../controllers/category")

admin_route.use(bodyParser.json());

admin_route.use(bodyParser.urlencoded({extended:true}))
 admin_route.use(session({secret:"hello he there".sessionSecret,
    resave: true,
     saveUninitialized: true}))
    
   


admin_route.set('view engine','ejs');
admin_route.set('views','./views/admin');



admin_route.get('/',auth.isLogout,adminController.loadLogin)

admin_route.post('/',adminController.verifyLogin)


admin_route.get('/reg',adminController.loadRegister)

admin_route.post('/reg',adminController.insertUSer)

admin_route.get('/home',adminController.loadDashBoard)

admin_route.get('/products',auth.isLogin,adminController.loadproduct)

admin_route.get('/add-product',auth.isLogin,addproductController.addproduct)

admin_route.post('/add-product',upload.array('image',4),addproductController.insertProduct)

admin_route.get('/add-category',auth.isLogin,addcategoryController.loadcategory)

admin_route.post('/add-category',upload.single('image'), addcategoryController.insertCategory)

admin_route.post('/delete-product',auth.isLogin,addproductController.deleteProduct)

admin_route.get('/edit-product',addproductController.editProduct)

admin_route.post('/edit-product',upload.array('image',4),addproductController.updateProduct)

admin_route.get('/users',auth.isLogin,adminController.loadUser)

admin_route.post('/user-block',auth.isLogin,adminController.userBlock)

admin_route.get('/view-product',auth.isLogin,addproductController.viewProduct)

admin_route.post('/delete-category',auth.isLogin,addcategoryController.deleteCategory)

admin_route.get('/edit-category',auth.isLogin,addcategoryController.updateCategory)

admin_route.post('/edit-category',auth.isLogin,upload.single('image'),addcategoryController.categoryEdit)

admin_route.get('/logout',adminController.logout)

admin_route.get('/orders',adminController.viewOrder)

admin_route.get('/edit-order',adminController.order)

admin_route.post('/edit-order',adminController.updateOrder)

admin_route.get('/coupen',adminController.coupen)

admin_route.post('/coupen',adminController.addCoupen)

admin_route.get('/view-coupen',adminController.viewCoupen)

admin_route.get('/category',adminController.loadCategory)

admin_route.post('/delete-coupen',adminController.deleteCoupen)

admin_route.get('/banner',adminController.loadBanner)

admin_route.get('/add-banner',adminController.addBanner)

admin_route.post('/add-banner',upload.single('image'),adminController.editBanner)

admin_route.post('/delete-banner',adminController.deleteBanner)

admin_route.get('/delete-image',adminController.deleteImage)

admin_route.get('/sales',adminController.loadSales)

admin_route.post('/sales-report',adminController.salesReport)

admin_route.post('/export-sales',adminController.exportSales)

admin_route.get('/edit-coupen',adminController.editCoupen)

admin_route.post('/edit-coupen',adminController.postCoupen)


module.exports = admin_route