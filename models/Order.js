//Order Model
//Option 2
//Dependencies
const mongoose = require("mongoose");

//Schema/Blueprint
const orderSchema = new mongoose.Schema({

	userId: {
    	type: mongoose.Schema.Types.ObjectId,
   		ref: 'User', // Reference to the User model
    	required: true
  	},

  	products: [
    	{
      		productId: {
        		type: mongoose.Schema.Types.ObjectId,
        		ref: 'Product' // Reference to the Product model
      		},
      		productName: {
        		type: String, // Corrected the type to String
        		required: true // Assuming product names are required
      		},
      		unitPrice: Number,
      		quantity: {
        		type: Number,
        		required: true
      		},
      		subtotal: Number
    	}
  	],

  	totalAmount: {
    	type: Number,
    	required: true
  	},

  	voucherDiscount: {
  		type: Number,
  		default: 0
  	},

  	totalAmountDue:{
  		type: Number,
  		required: true
  	},

  	modeOfPayment:{
  		type: String,
  		required: true
  	},

  	shippingDetails: {
    	type: mongoose.Schema.Types.Mixed,
    	ref: 'User.address', // Reference to the 'address' subdocument of the 'User' model
    	required: true
  	},

  	orderStatus:{
  		type: String,
  		default: "pending"
  	},

  	purchasedOn: {
    	type: Date,
    	default: new Date()
  	}	
})

//Model
module.exports = mongoose.model("Order", orderSchema);