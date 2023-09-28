//Voucher Model
//Dependencies
const mongoose = require("mongoose");

//Schema/Blueprint
const voucherSchema = new mongoose.Schema({

	name: {
		type: String, 
		required: [true, "Email is required!"]
	},

	code: {
		type: String,
		required: [true, "Code is required!"]
	},

	type: { 
		type: String, 
		required: [true, "Type is required!"]
	},

	value: { //percentage or amount
		type: Number,
		required: [true, "Value is required!"]
	},

	isActive: { 
		type: Boolean, 
		default: true
	},
});

//Model
module.exports = mongoose.model("Voucher", voucherSchema);