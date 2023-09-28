//User Model
//Option 2
//Dependencies
const mongoose = require("mongoose");

//Schema/Blueprint
const userSchema = new mongoose.Schema({
	
	email: {
		type: String,
		required: [true, "Email is required!"]
	},
	firstName: {
		type: String,
		required: [true, "First Name is required!"]
	},
	lastName: {
		type: String,
		required: [true, "Last Name is required!"]
	},
	password: {
		type: String,
		required: [true, "Password is required!"]
	},
	isAdmin: {
		type: Boolean,
		default: false
	},
	cart: {
	    addedProducts: [
	      {
	        productId: {
	          type: mongoose.Schema.Types.ObjectId, // Reference to product
	          ref: 'Product'
	        },
	        productName: String,
	        unitPrice: Number,
	        quantity: {
	        		type: Number,
	        		default: 1
	        		},
	        subtotal: Number
	      }
	    ],
	    totalPrice: {
	    	type: Number,
	    	default: 0
  		}
  	},
  	address: {
  		region: {
	  		type: String,
			required: [true, "Region is required!"]
  		},
  		province: { 
	  		type: String,
			required: [true, "Province is required!"] 
  		},
  		city: { 
  			type: String,
			required: [true, "City is required!"]
  		},
  		barangay: { 
  			type: String,
			required: [true, "Barangay is required!"] 
  		},
  		streetName: { 
  			type: String,
			required: [true, "Street Name is required!"] 
  		},
  		buildingHouseNumber: { 
  			type: String,
			required: [true, "Building/House No. is required!"]
  		}
  	}
});

//Model
module.exports = mongoose.model("User", userSchema);