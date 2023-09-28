//Voucher Routes
//Dependencies and Controllers
const express = require("express");
const voucherController = require("../controllers/voucherController");
const auth = require("../auth");
const {verify, verifyAdmin} = auth;

//Routing Component
const router = express.Router();

//Routes
//Create voucher (Admin only)
router.post("/create-voucher", verify, verifyAdmin, voucherController.createVoucher)

//Get all vouchers (Admin only)
router.get("/", verify, verifyAdmin, voucherController.getAllVouchers)

//Get all active vouchers (Admin only)
router.get("/active-vouchers", verify, verifyAdmin, voucherController.getAllActiveVouchers)

//Arhive voucher (Admin only)
router.put("/archive-voucher/:voucherId", verify, verifyAdmin, voucherController.archive)

//Activate voucher (Admin only)
router.put("/activate-voucher/:voucherId", verify, verifyAdmin, voucherController.activate)

//Activate voucher (Admin only)
router.put("/apply-voucher", verify, voucherController.applyVoucher)

//Export Route System
module.exports = router;