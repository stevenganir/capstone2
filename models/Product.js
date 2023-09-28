//Product Model
//Option 2
//Dependencies
const mongoose = require("mongoose");
const { isURL } = require("validator");

// Schema/Blueprint
const productSchema = new mongoose.Schema({
	
	name: {
		type: String,
		required: [true, "Name is required!"]
	},
	description: {
		type: String,
		required: [true, "Description is required!"]
	},
	price: {
		type: Number,
		required: [true, "Price is required!"]
	},
	stockQuantity:{
		type: Number,
		default: 0
	},
	isActive: {
		type: Boolean,
		default: true
	},
	createdOn: {
		type: Date,
		default: new Date()
	},
	imageUrl: {
    type: String,
    required: [true, "Image is required!"],
    validate: {
      validator: function (v) {
        return isURL(v); // Use the isURL validator from the validator library
      },
      message: (props) => `${props.value} is not a valid URL!`,
    },
  },
});

//Model
module.exports = mongoose.model("Product", productSchema);