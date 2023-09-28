//User Routes
//Dependencies and Controllers
const express = require("express");
const userController = require("../controllers/userController");
const auth = require("../auth");
const {verify, verifyAdmin} = auth;

//Routing Component
const router = express.Router();

//Routes
//User registration 
router.post("/register", userController.registerUser);

//User authentication 
router.post("/authentication", userController.authentication);

//User details (Auth)
router.get('/user-details', verify, userController.getUserProfile);

//Update user details (Auth)
router.put('/update-user-details', verify, userController.updateUserDetails);

//Get all users (Admin only)
router.get('/', verify, verifyAdmin, userController.getAllUsers);

//Make a user an admin Route (Admin only)
router.put('/make-admin', verify, verifyAdmin, userController.makeAdmin);

//Delete a user (Admin only)
router.delete("/delete", verify, verifyAdmin, userController.deleteUser)

//Export Route System
module.exports = router;