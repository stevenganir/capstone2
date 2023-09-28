//Product Routes
//Dependencies and Controllers
const express = require("express");
const productController = require("../controllers/productController");
const auth = require("../auth");
const {verify, verifyAdmin} = auth;

//Routing Component
const router = express.Router();

//Routes
//Create product (Admin only)
router.post('/create', verify, verifyAdmin, productController.createProduct);

//Get all products (Admin only)
router.get('/', productController.getAllProducts);

//Get all active products
router.get('/active-products', productController.getAllActiveProducts);

//Get a specific product by name
router.post('/get-product/name', productController.getProductByName);

//Get a specific product by product ID
router.get('/get-product/:productId', productController.getProductById);

//Get and filter active products
router.post('/get-products/filter', productController.filterAndGetProducts);

//Update product information (Admin only)
router.put('/update-product/:productId', verify, verifyAdmin, productController.updateProduct);

//Archive a product (Admin only)
router.put('/archive-product/:productId', verify, verifyAdmin, productController.archive);

//Activate a product (Admin only)
router.put('/activate-product/:productId', verify, verifyAdmin, productController.activate);

//Export Route System
module.exports = router;
