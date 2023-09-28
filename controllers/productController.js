//Product Controller
//Dependencies and Models
const auth = require("../auth")
const Product = require("../models/Product");



//Product Creation (POST)
/*
	1. Destructure the request body
	2. Create an Object with the key and value from the request body
	3. Save the Object in the database
*/

module.exports.createProduct = async (req, res) => {
  try {
    const { name, description, price, stockQuantity, imageUrl } = req.body;

    // Check if the product name already exists
    const existingProduct = await Product.findOne({ name });

    if (existingProduct) {
      return res.status(400).json({ message: 'Product with the same name already exists' });
    }

    const newProduct = new Product({
      name,
      description,
      price,
      imageUrl: imageUrl || 'https://i.ibb.co/GMVtkGx/placeholder.png',
      stockQuantity: stockQuantity || 0, // Set stockQuantity to 0 if not provided
    });

    await newProduct.save();

    res.status(201).json({ message: 'Product created successfully', product: newProduct });
  } catch (error) {
    res.status(500).json({ message: 'An error occurred while creating the product', error });
  }
};

//Get all products (GET)
/*
	1. Use find() method to get all products
	2. Send the products as a response
*/

module.exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

//Get all active products (GET)
/*
	1. Use find() method to get all products which has a value of true in the isActive key
	2. Send all the collected products as a response
*/
module.exports.getAllActiveProducts = async (req, res) => {
  try {
    const activeProducts = await Product.find({ isActive: true });
    res.json(activeProducts);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

//Get a specific product by name (POST)
/*
	1. Use findOne() method to find a match of the name in the request body to the product names in the database
	2. If no product is found, return a message
	3. If there is a matching product name, send it as a response
*/

module.exports.getProductByName = async (req, res) => {
  const productName = req.body.name; // Product name from request body

  try {
    // Use a case-insensitive regular expression to find the product
    const product = await Product.findOne({
      name: { $regex: new RegExp(productName, 'i') }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if(product.isActive === false){
      return res.status(400).json({ message: 'Product not available as of the moment' });
    }

    return res.status(200).json(product);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error' });
  }
};

//Get a specific product by product ID (GET)
/*
	1. Use the findById() method to find a match of the product ID in the url to the product IDs in the database
	2. If no product is found, return a message
	3. If there is a matching product ID, send it as a response
*/
module.exports.getProductById = async (req, res) => {
  try {
    const productId = req.params.productId; // Assuming the route parameter is named "productId"
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.status(200).json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Get and filter active products (POST)
/*
*/
module.exports.filterAndGetProducts = async (req, res) => {
  try {
    let query = {};

    // Check if product name is provided in the request body
    if (req.body.name) {
      // Case-insensitive search for product name
      query.name = { $regex: new RegExp(req.body.name, 'i') };
    }

    // Check if price range is provided in the request body
    if (req.body.minPrice || req.body.maxPrice) {
      query.price = {};

      if (req.body.minPrice) {
        query.price.$gte = req.body.minPrice;
      }

      if (req.body.maxPrice) {
        query.price.$lte = req.body.maxPrice;
      }
    }

    // Only retrieve active products
    query.isActive = true;

    const products = await Product.find(query);

    if (products.length === 0) {
      // No product found that matches the query
      res.status(404).json({ message: 'No product found that matches the query' });
    } else {
      res.status(200).json(products);
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
};

//Update Product Information by ID (PUT)
/*
	1. Check if the request body is not empty
	2. Use the findByIdAndUpdate() method to find a match of the product ID in the url to the product IDs in the database, 
	3. Update the product information in the database with the new product information in the request body
	4. If no product is found, return a message
*/


module.exports.updateProduct = async (req, res) => {
  const productId = req.params.productId;
  const updates = req.body;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'At least one parameter should be updated' });
  }

  //Check if stockQuantity value is valid
  if(updates.stockQuantity){
    if(updates.stockQuantity < 0){
      return res.status(400).json({ message: "Can't update stock quantity to less than 0." });
    }
  }

  try {
    const unupdatedProduct = await Product.findById(productId)
    const updatedProduct = await Product.findByIdAndUpdate(productId, updates, { new: true });

    if (!updatedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    //Activate product only if stockQuantity before update is 0.
    if(updatedProduct.stockQuantity > 0 && unupdatedProduct.stockQuantity === 0){
      updatedProduct.isActive = true
    }

    //Archive product if new quantity is less than or equal to 0.
    if(updatedProduct.stockQuantity <= 0){
      updatedProduct.isActive = false
    }

    await updatedProduct.save()

    return res.status(200).json({message: `Product ${updatedProduct.name} has been successfully updated`, updatedProduct});
  } catch (error) {
    return res.status(500).json({ message: 'An error occurred while updating the product' });
  }
};

//Archive a product (PUT)
/*
	1. Use the findById() method to find a match of the product ID in the url to the product IDs in the database
	2. If no product is found, return a message
	3. If there is a matching product ID, check if the product is already archived
	4. If not archived, set the isActive key to false.
	5. Save the changes to the database
*/

module.exports.archive = async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (!product.isActive) {
      return res.json({ message: `${product.name} is already archived` });
    }

    // Archive the product
    product.isActive = false;
    await product.save();

    res.status(200).json({ message: `${product.name} has been successfully archived` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while archiving the product' });
  }
};

//Activate Product (PUT)
/*
	1. Use the findById() method to find a match of the product ID in the url to the product IDs in the database
	2. If no product is found, return a message
	3. If there is a matching product ID, check if the product is already activated
	4. If not activated, set the isActive key to true.
	5. Save the changes to the database
*/

module.exports.activate = async (req, res) => {
  const productId = req.params.productId;

  try {
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if(product.stockQuantity === 0){
      return res.status(400).json({ message: 'Product has no stocks. Please restock first before activating' });
    }

    if (product.isActive) {
      return res.json({ message: `${product.name} is already activated` });
    }

    // Archive the product
    product.isActive = true;
    await product.save();

    res.json({ message: `${product.name} has been successfully activated` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while archiving the product' });
  }
};
