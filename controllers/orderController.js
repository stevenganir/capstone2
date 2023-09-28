//Order Controller
//Models
const Order = require("../models/Order");
const Product = require("../models/Product")
const User = require("../models/User")
const Voucher = require("../models/Voucher")


//Create an order (POST)
/*

*/
module.exports.createOrder = async (req, res) => {
  try {
    const user = await User.findOne({_id:req.user.id});
    
    if (user.isAdmin) {
      return res.status(403).json({ message: 'Admin users cannot create orders. Please change to a customer account.' });
    }

    // Declaring variables to be used in processing the req.body
    let products;
    let voucherCode;
    let modeOfPayment;

    // Destructuring the req.body
      // If the request body is an array
    if (req.body.products) {
      products = req.body.products;
    }
    else{
      return res.status(400).json({message: 'No products in the request body'});
    }

    if(req.body.voucherCode !== ''){
      voucherCode = req.body.voucherCode;
    }

    if (req.body.modeOfPayment) {
      if (req.body.modeOfPayment.toLowerCase() === "cash on delivery" ||
          req.body.modeOfPayment.toLowerCase() === "credit/debit card" ||
          req.body.modeOfPayment.toLowerCase() === "credit card" ||
          req.body.modeOfPayment.toLowerCase() === "debit card" ||
          req.body.modeOfPayment.toLowerCase() === "mobile wallet"
        ){
        modeOfPayment = req.body.modeOfPayment;
      }
      else{
        return res.status(400).json({message: 'Invalid mode of payment. Valid modes of payment: 1. "Cash on Delivery", 2. "Credit/Debit Card", 3. "Mobile Wallet"'});
      }
    }
    else{
      return res.status(400).json({message: 'No modeOfPayment in the request body'});
    }

    // Initializing variables to be used in processing the ordered products
    let totalAmount = 0;
    let orderProducts = [];

    // Loop to process every ordered product
    for (let i = 0; i < products.length; i++) {
      //Destructuring the product array
      const { productName, quantity } = products[i];

      // Fetching the product in database based on the provided name (case-insensitive search)
      const product = await Product.findOne({ name: { $regex: new RegExp(productName, 'i') }, isActive: true });

      // If the product does not exist in the database or is inactive
      if (!product) {
        return res.status(400).json({ message: `Product "${productName}" not found or not active.` });
      }

      if(product.stockQuantity < quantity || product.stockQuantity <= 0){
        return res.status(400).json({ message: `Product "${productName}" has not enough stocks than your order. Remaining stocks: ${product.stockQuantity}, quantity of your order: ${quantity}` });
      }

      // Reassigning the total amount every loop
      totalAmount += product.price * quantity;

      subtotal = product.price * quantity;

      product.stockQuantity -= quantity

      if(product.stockQuantity <= 0){
        product.isActive = false
      }

      product.save()

      orderProducts.push({ productId: product._id, productName, unitPrice: product.price, quantity, subtotal });
    }

    // Initializing variables to be used in processing the voucher
    let voucherDiscount = 0;
    let totalAmountDue = 0;

    if (voucherCode) {
      // Fetch the voucher based on the provided voucher code
      const voucher = await Voucher.findOne({ code: voucherCode, isActive: true });

      if (voucher && voucher.type === 'amount') {
        voucherDiscount = voucher.value;
        totalAmountDue = totalAmount - voucherDiscount; // Subtract the voucher value from the totalAmount
      } 
      else if (voucher && voucher.type === 'percent') {
        voucherDiscount = totalAmount * (voucher.value/100) ;
        totalAmountDue = totalAmount - voucherDiscount; // Subtract the voucher value from the totalAmount
      } 
      else {
        return res.status(400).json({ message: 'Invalid or inactive voucher code.' });
      }
    }
    else{
      totalAmountDue = totalAmount
    }

    const newOrder = new Order({
      userId: user.id,
      products: orderProducts,
      totalAmount,
      voucherDiscount,
      totalAmountDue, // Adjusted calculation of totalAmountDue
      modeOfPayment,
      shippingDetails: user.address,
      purchasedOn: new Date()
    });

    await newOrder.save();

    let orderResponse

    if(voucherDiscount > 0){
      orderResponse = {
        message: 'Order created successfully',
        order: newOrder
      };
    }
    else{
      orderResponse = {
        message: 'Order created successfully',
        order:{
          userId: newOrder.userId,
          products: newOrder.products,
          totalAmountDue: newOrder.totalAmountDue,
          modeOfPayment: newOrder.modeOfPayment,
          shippingDetails: user.address,
          orderStatus: newOrder.orderStatus,
          purchasedOn: newOrder.purchasedOn,
          _id: newOrder._id,
          __v: newOrder.__v
        }
      }
    }

    res.status(201).json(orderResponse);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'An error occurred while creating the order.' });
  }
};


//Retrieve all user orders (GET)
/*

*/

module.exports.getUserOrders = async (req, res) => {
  try {
    const user = await User.findById(req.user.id); // Assuming the authenticated user is available in req.user

    if(!user){
      return res.status(400).json({ message: "User not found." });
    }

    if (user.isAdmin) {
      return res.status(403).json({ message: "Admins cannot create and retrieve user-orders. Please change to a customer account." });
    }

    const orders = await Order.find({ userId: user.id }); // Selecting specific fields to show

    res.status(200).json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Retrieve all orders (GET)
/*
*/

module.exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()

    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while fetching orders.' });
  }
}

//Change order status to processing (PUT)

module.exports.processing = async (req, res) => {

  const { orderId } = req.body;

  try {
        const order = await Order.findById(orderId);

        if (!order) {
          res.status(404).json({ orderId, message: 'Order not found' });
        }else {
          order.orderStatus = 'processing';
          await order.save();
        }
    return res.status(200).json({ message: `${orderId} set to Processing` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Change order status to shipped (PUT)

module.exports.shipped = async (req, res) => {

  const { orderId } = req.body;

  try {
        const order = await Order.findById(orderId);

        if (!order) {
          res.status(404).json({ orderId, message: 'Order not found' });
        }else {
          order.orderStatus = 'shipped';
          await order.save();
        }
    return res.status(200).json({ message: `${orderId} set to Shipped` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Change order status to outForDelivery (PUT)

module.exports.outForDelivery = async (req, res) => {

  const { orderId } = req.body;

  try {
        const order = await Order.findById(orderId);

        if (!order) {
          res.status(404).json({ orderId, message: 'Order not found' });
        }else {
          order.orderStatus = 'out for delivery';
          await order.save();
        }
    return res.status(200).json({ message: `${orderId} set to Out for Delivery` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Change order status to delivered (PUT)

module.exports.delivered = async (req, res) => {

  const { orderId } = req.body;

  try {
        const order = await Order.findById(orderId);

        if (!order) {
          res.status(404).json({ orderId, message: 'Order not found' });
        }else {
          order.orderStatus = 'delivered';
          await order.save();
        }
    return res.status(200).json({ message: `${orderId} set to Delivered` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Change order status to cancelled (PUT)

module.exports.cancelled = async (req, res) => {

  const { orderId } = req.body;

  try {
        const order = await Order.findById(orderId);

        if (!order) {
          res.status(404).json({ orderId, message: 'Order not found' });
        }else {
          order.orderStatus = 'cancelled';
          await order.save();
        }
    return res.status(200).json({ message: `${orderId} set to Cancelled` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

//Change order status to completed (PUT)

module.exports.completed = async (req, res) => {

  const { orderId } = req.body;

  try {
        const order = await Order.findById(orderId);

        if (!order) {
          res.status(404).json({ orderId, message: 'Order not found' });
        }else {
          order.orderStatus = 'completed';
          await order.save();
        }
    return res.status(200).json({ message: `${orderId} set to Completed` });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};