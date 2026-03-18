const Supplier = require("../models/Supplier");

exports.createSupplier = async (req, res) => {
    try {
        const { title } = req.body;
        const contactMail = req.body.contactEmail || "";
        const phone = req.body.phone || "";

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
    try {
        const { id } = req.params;

        const supplier = await Supplier.findById(id);

        if (!supplier) return res.status(404).json({ error: "Supplier not found" });

        return res.json(supplier);
    } catch (err) {
        console.error(`Could not get supplier by id ${err.message}`);
        return res.status(500).json({ error: `Could not get supplier by id ${err.message}` });
    }
};

exports.getSuppliers = async (_req, res) => {
    try {
        const suppliers = await Supplier.find();
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

        const updatedSupplier = await Supplier.findByIdAndUpdate(
            id,
            {
                title,
                contactMail,
                phone,
                isActive,
            },
            // { new: true },
        );
        // console.log(updatedSupplier);

        if (!updatedSupplier) {
            return res.status(404).json({ error: "Supplier not found" });
        }

        return res.status(200).json(updatedSupplier);
    } catch (err) {
        console.error(`Could not update a supplier ${err.message}`);
        return res.status(500).json({ error: `Could not update a supplier ${err.message}` });
    }
};
