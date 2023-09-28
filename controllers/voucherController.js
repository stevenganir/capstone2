//Voucher Controller
//Dependencies and Models
const auth = require("../auth")
const Voucher = require("../models/Voucher");
const User = require("../models/User");


//Create voucher (POST)
/*
*/
module.exports.createVoucher = async (req, res) =>{
	try {
	    const { name, code, type, value } = req.body;

	    // Check if the Voucher name already exists
	    const existingVoucher = await Voucher.findOne({ code });

	    if (existingVoucher) {
	      return res.status(400).json({ message: 'Voucher with the same name already exists' });
	    }

      if(type.toLowerCase() !== "amount" && type.toLowerCase() !== "percent"){
        return res.status(400).json({ message: 'Invalid type of voucher. Valid types of voucher: 1. Amount or 2. Percent' });
      }

	    const newVoucher = new Voucher({
	      name,
	      code,
	      type,
	      value,
	    });

	    await newVoucher.save();

	    res.status(201).json({ message: 'Voucher created', voucher: newVoucher });
	  } catch (error) {
	    res.status(500).json({ message: 'An error occurred while creating the voucher', error });
	  }
	};

//Get all vouchers (GET)
/*

*/
module.exports.getAllVouchers = async (req, res) => {
  try {
    const vouchers = await Voucher.find({});
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

//Get all active vouchers (GET)
/*

*/
module.exports.getAllActiveVouchers = async (req, res) => {
  try {
    const activeVouchers = await Voucher.find({isActive: true});
    res.json(activeVouchers);
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
};

//Activate voucher (PUT)
/*

*/
module.exports.archive = async (req, res) => {
  const voucherId = req.params.voucherId;

  try {
    const voucher = await Voucher.findById(voucherId);

    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    if (!voucher.isActive) {
      return res.json({ message: `Voucher ${voucher.code} is already archived` });
    }

    // Archive the voucher
   voucher.isActive = false;
    await voucher.save();

    res.status(200).json({ message: `Voucher ${voucher.code} has been archived` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while archiving the voucher' });
  }
};

//Activate voucher (PUT)
/*

*/
module.exports.activate = async (req, res) => {
  const voucherId = req.params.voucherId;

  try {
    const voucher = await Voucher.findById(voucherId);

    if (!voucher) {
      return res.status(404).json({ message: 'Voucher not found' });
    }

    if (voucher.isActive) {
      return res.json({ message: `Voucher ${voucher.code} is already activated` });
    }

    // Archive the voucher
   voucher.isActive = true;
    await voucher.save();

    res.status(200).json({ message: `Voucher ${voucher.code} has been activated` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while activating the voucher' });
  }
};

//Apply voucher (GET)

module.exports.applyVoucher = async (req, res) => {
  const code = req.body.voucherCode;

  try {
    const voucher = await Voucher.findOne({code});

    if (!voucher) {
      return res.status(404).json({ message: 'Invalid Voucher Code' });
    }

    if (voucher.isActive === false) {
      return res.json({ message: 'Invalid Voucher Code' });
    }


    res.status(200).json(voucher);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'An error occurred while activating the voucher' });
  }
};