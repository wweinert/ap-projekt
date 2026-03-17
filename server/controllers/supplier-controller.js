const Supplier = require("../models/Supplier");

exports.createSupplier = async (req, res) => {
    try {
        const { title, contactMail, phone } = req.body;

        const supplier = await Supplier.create({
            title,
            contactMail,
            phone,
            isActive: true,
            createdAt: new Date(),
        });

        return res.json(supplier);
    } catch (err) {
        console.error(`Could not create a supplier ${err.message}`);
        return res.status(500).json({ error: `Could not create a supplier ${err.message}` });
    }
};

exports.getSupplierById = async (req, res) => {
    const { id } = req.params;
    console.log(id);

    try {
        const supplier = await Supplier.findById(id);
        console.log(supplier);

        return res.json(supplier);
    } catch (err) {
        console.error(`Could not get supplier by id ${err.message}`);
        return res.status(500).json({ error: `Could not get supplier by id ${err.message}` });
    }
};
exports.getSuppliers = async (_req, res) => {
    try {
        const suppliers = await Supplier.find();
        console.log(suppliers);

        return res.json(suppliers);
    } catch (err) {
        console.error(`Could not get suppliers ${err.message}`);
        return res.status(500).json({ error: `Could not get suppliers ${err.message}` });
    }
};

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, contactMail, phone, isActive } = req.body;

        const supplier = await Supplier.findById(id);
        supplier.title = title;
        supplier.contactMail = contactMail;
        supplier.phone = phone;
        supplier.isActive = isActive;
        await supplier.save();
        console.log(supplier);

        return res.status(200).json(supplier);
    } catch (err) {
        console.error(`Could not update a supplier ${err.message}`);
        return res.status(500).json({ error: `Could not update a supplier ${err.message}` });
    }
};
