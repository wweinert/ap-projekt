const Supplier = require("../models/Supplier");

exports.createSupplier = async (req, res) => {
    try {
        const { title, contactMail, phone } = req.body;

        const supplier = await Supplier.create({
            title,
            contactMail,
            phone,
            createdAt: new Date(),
        });

        return res.json(supplier);
    } catch (err) {
        console.error(`Could not create a supplier ${err.message}`);
        return res.status(500).json({ error: `Could not create a supplier ${err.message}` });
    }
};

exports.getSuppliers = async (req, res) => {
    try {
        const suppliers = await Supplier.find()
        console.log(suppliers);
        
        return res.json(suppliers);
    } catch (err) {
        console.error(`Could not get suppliers ${err.message}`);
        return res.status(500).json({ error: `Could not get suppliers ${err.message}` });
    }
};
