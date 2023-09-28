//Dependencies and Modules
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require('body-parser');
const cors = require("cors")

const userRoutes = require("./routes/userRoutes")
const productRoutes = require("./routes/productRoutes")
const orderRoutes = require("./routes/orderRoutes")
const cartRoutes = require("./routes/cartRoutes")
const voucherRoutes = require("./routes/voucherRoutes")

//Environment Setup
const port = 4000;

//Server Setup
const app = express();
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({extended:true}));
app.use(cors());

//Database Connection
	//Connecting to MongoDB Database
	mongoose.connect("*DB*", 
		{
			useNewUrlParser: true,
			useUnifiedTopology: true
		}
	)

	//Bash prompt
	let db = mongoose.connection;
	db.on("error", console.error.bind(console, "Connection error"))
	db.once("open", ()=>console.log("Connected to MongoDB Atlas"))

	//Backend Routes
	app.use("/user", userRoutes)
	app.use("/product", productRoutes)
	app.use("/order", orderRoutes)
	app.use("/cart", cartRoutes)
	app.use("/voucher", voucherRoutes)

//Server Gateway Respone
if(require.main === module){
	app.listen(process.env.PORT || port, ()=>{
		console.log(`API is now online on port ${process.env.PORT || port}`)
	})
}

//Exporting Express and Mongoose
module.exports = {app, mongoose};