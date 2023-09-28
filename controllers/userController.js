//User Controller
//Dependencies and Models
const auth = require("../auth")
const bcrypt = require("bcrypt");
const User = require("../models/User");


//User Registration (POST)
/*
	1. Verify if the email given is already in the db, if it is, return a message.
	2. Hash the password for security (both in response and in db)
	3. Save the credentials in the database.
	4. Return a message to the user.
*/

module.exports.registerUser = async (req, res) => {
  try {
    const { email, firstName, lastName, address, password } = req.body;

    // Check if user with the given email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email Address Already Registered" });
    }

    if (password.length < 8 ){
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Hash the password before storing it
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, firstName, lastName, address, password: hashedPassword });
    await newUser.save();

    // Exclude the cart field from the response
    const { cart, ...userWithoutCart } = newUser.toObject();

    res.status(201).json({ message: 'Registration Successful', user: userWithoutCart });
  } catch (error) {
    res.status(500).json({ message: 'Please try again', error: error.message });
  }
};


//User Authentication (POST)
/*
	1. Find the email given in the database, if not in database, return a message.
	2. Check if the password given matches the password in the database, if not a match, return a message
  3. Create an access token using module in auth
  4. Return a message and the token.
*/

module.exports.authentication = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Email not yet registered' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Password Doesn't Match" });
    }

    // Create an access token using your createAccessToken function
    const accessToken = auth.createAccessToken(user);

    return res.status(200).json({ message: 'Login Successful', accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//User details (POST)
/*

*/
module.exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is stored in the authenticated user's request object

    const user = await User.findById(userId) // Excluding password from the response

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

//Update user details (PUT)
/*

*/
module.exports.updateUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-cart');
    const updateData = req.body; // Assuming the request body contains the updated user details as an object

    // Check if the request body is empty
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: 'At least one data field should be provided' });
    }

    // Check if there's a password change in the updateData
    if (updateData.password) {
      // Hash the new password
      const saltRounds = 10; // You can adjust this value for bcrypt's salt rounds
      const hashedPassword = await bcrypt.hash(updateData.password, saltRounds);

      // Update the password field in updateData with the hashed password
      updateData.password = hashedPassword;
    }

    // Validate the address object
    if (updateData.address) {
      const addressKeys = Object.keys(updateData.address);
      const missingKeys = [];

      // Check for missing keys in the address object
      const requiredAddressKeys = ['region', 'province', 'city', 'barangay', 'streetName', 'buildingHouseNumber'];

      for (const key of requiredAddressKeys) {
        if (!addressKeys.includes(key) || !updateData.address[key]) {
          missingKeys.push(key);
        }
      }

      if (missingKeys.length > 0) {
        return res.status(400).json({ message: `Address object is missing required keys: ${missingKeys.join(', ')}` });
      }
    }

    // Ensure that isAdmin and cart cannot be modified
    delete updateData.isAdmin;
    delete updateData.cart;

    // Use projection to exclude the 'cart' field from the query result
    const projection = { cart: 0 };

    // Find the user by ID and update their email, password, and address details
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      { $set: { ...updateData } },
      { new: true, projection }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const responseUser = {
      _id: updatedUser._id,
      email: updatedUser.email,
      password: updatedUser.password, // This should be hashed; consider if you want to include it
      address: updatedUser.address,
      isAdmin: updatedUser.isAdmin,
      __v: updatedUser.__v,
    };

    res.status(200).json({ message: `Profile Updated!`});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

//Get all users (GET)
/*

*/
module.exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find(); // Retrieve all users from the database

    res.status(200).json(users);

  } catch (error) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
};


//Make a user an Admin (PUT)
/*

*/
module.exports.makeAdmin = async (req, res)=> {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.isAdmin) {
      return res.status(400).json({ message: 'User is already an admin' });
    }

    user.isAdmin = true;
    await user.save();

    return res.status(200).json({ message: `User ${userId} is now an Admin.` });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

//Delete a user (DELETE)
/*
*/
module.exports.deleteUser = async (req, res) => {
  const { userId } = req.body;

  try {
    // Find the user and store their information
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Store the user's information in the desired order
    const userInfo = {
      _id: user._id,
      email: user.email,
      password: user.password,
      address: user.address,
      isAdmin: user.isAdmin,
      cart: user.cart,
      __v: user.__v
    };

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({
      message: `User has been successfully deleted`,
      deletedUserInfo: userInfo // Include the deleted user's info in the response
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};