//User Routes
//Dependencies and Controllers
const express = require("express");
const userController = require("../controllers/userController");
const cartController = require("../controllers/cartController");
const auth = require("../auth");
const {verify, verifyAdmin} = auth;

//Routing Component
const router = express.Router();

//Routes
//Add to cart (Auth)
router.post('/addToCart', verify, cartController.addToCart);

//Get user cart (Auth)
router.get("/user-cart", verify, cartController.getUserCart)

//Update cart item quantity (Auth)
router.put('/updateQuantity', verify, cartController.updateProductQuantity)

//Delete cart item (Auth)
router.delete('/deleteCartItem', verify, cartController.deleteCartItem);

//Cart checkout (Auth)
router.post('/checkout', verify, cartController.checkout);

//Export Route System
module.exports = router;