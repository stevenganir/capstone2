//Cart Controller
//Models
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Voucher = require("../models/Voucher")

//Add to cart (POST)
/*
  1. Find the User in the database to retrieve the user's cart.
  2. Process the request body
*/
module.exports.addToCart = async (req, res) => {
  const { productName, quantity } = req.body;
  const userId = req.user.id; // Assuming user is authenticated and user object is available through req.user

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ message: 'Admin cannot add to cart. Switch to a customer account.' });
    }

    const product = await Product.findOne({name: { $regex: new RegExp(productName, 'i') }});

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const existingCartItemIndex = user.cart.addedProducts.findIndex(item => item.productId.equals(product._id));

    if (existingCartItemIndex !== -1) {
      // If product already exists in cart, update quantity and subtotal
      user.cart.addedProducts[existingCartItemIndex].quantity += quantity || 1;
      user.cart.addedProducts[existingCartItemIndex].subtotal += product.price * (quantity || 1);
    } else {
      // If product doesn't exist in cart, add a new cart item
      const cartItem = {
        productId: product._id,
        productName: product.name,
        unitPrice: product.price,
        quantity: quantity || 1,
        subtotal: product.price * (quantity || 1)
      };

      user.cart.addedProducts.push(cartItem);
    }

    user.cart.totalPrice += product.price * (quantity || 1);

    await user.save();

    res.status(200).json({ message: `${productName} added to cart`, cart: user.cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred' });
  }
};

//Get user cart (GET)
/*
*/
module.exports.getUserCart = async (req, res) => {
  try {
    // Fetch the user by their ID (you should have authenticated the user first)
    const user = await User.findById(req.user.id);
    const cart = user.cart

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(403).json({ message: 'Admin cannot add to cart. Switch to a customer account.' });
    }

    // Check if the user has any items in their cart
    if (user.cart.addedProducts.length === 0) {
      return res.json({ message: 'No items in the cart', cart });
    }

    // If there are items in the cart, return them
    res.status(200).json({ cart });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Update cart item quantity (PUT)
module.exports.updateProductQuantity = async (req, res) => {
  const userId = req.user.id; // Assuming authenticated user ID is available in req.user

  const { productName, newQuantity } = req.body;

  if (!newQuantity && newQuantity !== 0) {
    return res.status(400).json({ message: 'Quantity must be provided.' });
  }

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartProduct = user.cart.addedProducts.find(product => 
      product.productName.toLowerCase() === productName.toLowerCase()
    );

    if (!cartProduct) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    if (newQuantity !== 0) {
      cartProduct.quantity = newQuantity;
      cartProduct.subtotal = cartProduct.unitPrice * newQuantity;
    }

    user.cart.totalPrice = user.cart.addedProducts.reduce((total, product) => total + product.subtotal, 0);
    await user.save();

    return res.status(200).json({ message: 'Cart updated successfully', cart: user.cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//Delete cart item (DELETE)
module.exports.deleteCartItem = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming authenticated user ID is available in req.user
    const { productName } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const cartProductIndex = user.cart.addedProducts.findIndex(product => 
      product.productName.toLowerCase() === productName.toLowerCase()
    );

    if (cartProductIndex === -1) {
      return res.status(404).json({ message: 'Product not found in cart' });
    }

    user.cart.addedProducts.splice(cartProductIndex, 1);

    user.cart.totalPrice = user.cart.addedProducts.reduce((total, product) => total + product.subtotal, 0);
    await user.save();

    return res.status(200).json({ message: 'Product removed from cart successfully', cart: user.cart });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//Cart checkout (POST)
/*
*/

module.exports.checkout = async (req, res) => {
  try {
   const user = await User.findOne({_id:req.user.id});

    if (user.isAdmin) {
      return res.status(403).json({ message: 'Admin users cannot create orders. Please change to a customer account.' });
    }

    if(user.cart.addedProducts.length === 0){
      return res.status(400).json({ message: 'Your cart is empty.'});
    }

    if (req.body.modeOfPayment) {
      if (req.body.modeOfPayment.toLowerCase() === "cash on delivery" ||
          req.body.modeOfPayment.toLowerCase() === "credit/debit card" ||
          req.body.modeOfPayment.toLowerCase() === "credit card" ||
          req.body.modeOfPayment.toLowerCase() === "debit card" ||
          req.body.modeOfPayment.toLowerCase() === "mobile wallets"
        ){
        modeOfPayment = req.body.modeOfPayment;
      }
      else{
        return res.status(400).json({message: 'Invalid mode of payment. Valid modes of payment: 1. "Cash on Delivery", 2. "Credit/Debit Card", 3. "Mobile Wallets"'});
      }
    }
    else{
      return res.status(400).json({message: 'No modeOfPayment in the request body'});
    }

    let totalAmount = 0;
    let orderProducts = [];

    for (let i = 0; i < user.cart.addedProducts.length; i++) {
      const {productName, quantity} = user.cart.addedProducts[i];

      // Fetch the product based on the provided name (case-insensitive search)
      const product = await Product.findOne({ name: { $regex: new RegExp(productName, 'i') }, isActive: true });

      if (!product) {
        return res.status(400).json({ message: `Product "${productName}" not found or not active.` });
      }

     if(product.stockQuantity < quantity || product.stockQuantity <= 0){
        return res.status(400).json({ message: `Product "${productName}" has not enough stocks than your order. Remaining stocks: ${product.stockQuantity}, quantity of your order: ${quantity}` });
      }

      totalAmount += product.price * quantity;

      subtotal = product.price * quantity;

      product.stockQuantity -= quantity

      if(product.stockQuantity <= 0){
        product.isActive = false
      }

      product.save()

      orderProducts.push({ productId: product._id, productName, unitPrice: product.price, quantity, subtotal });
    }

    let voucherCode
    
    if(req.body.voucherCode !== ''){
      voucherCode = req.body.voucherCode;
    }

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
        voucherDiscount = totalAmount * (voucher.value/100);
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

    // Clear the user's cart after successful checkout
    user.cart.addedProducts = [];
    user.cart.totalPrice = 0;
    await user.save();

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
    res.status(500).json({ error: 'An error occurred while creating the order.' });
  }
};