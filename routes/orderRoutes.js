//Product Routes
//Dependencies and Controllers
const express = require("express");
const orderController = require("../controllers/orderController");
const auth = require("../auth");
const {verify, verifyAdmin} = auth;

//Routing Component
const router = express.Router();

//Routes
//Create an order (Non-Admin only)
router.post('/create-order', verify, orderController.createOrder);

//Retrieve all user orders (Non-Admin only)
router.get('/user-orders', verify, orderController.getUserOrders);

//Retrieve all orders (Admin only)
router.get('/', orderController.getAllOrders);

//Change order status to processing (Admin only)
router.put('/update-status/processing', verify, verifyAdmin, orderController.processing);

//Change order status to shipped (Admin only)
router.put('/update-status/shipped', verify, verifyAdmin, orderController.shipped);

//Change order status to outForDelivery (Admin only)
router.put('/update-status/outForDelivery', verify, verifyAdmin, orderController.outForDelivery);

//Change order status to delivered (Admin only)
router.put('/update-status/delivered', verify, verifyAdmin, orderController.delivered);

//Change order status to cancelled (Admin only)
router.put('/update-status/cancelled', verify, verifyAdmin, orderController.cancelled);

//Change order status to completed (Admin only)
router.put('/update-status/completed', verify, verifyAdmin, orderController.completed);

//Export Route System
module.exports = router;
