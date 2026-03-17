const Report = require("../models/Report");

exports.createReport = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const { supplierId } = req.params;

        const report = await Report.create({
            title,
            description,
            status: !status ? "OK" : "DEFECT",
            supplierId,
            createdAt: new Date(),
        });

        return res.json(report);
    } catch (err) {
        console.error(`Could not create a report ${err.message}`);
        return res.status(500).json({ error: `Could not create a report ${err.message}` });
    }
};

exports.getBySupplierId = async (req, res) => {
    try {
        const { supplierId } = req.params;

        const report = await Report.find({ supplierId });
        console.log(report);

        return res.json(report);
    } catch (err) {
        console.error(`Could not create a report ${err.message}`);
        return res.status(500).json({ error: `Could not create a report ${err.message}` });
    }
};

exports.getReports = async (_req, res) => {
    try {
        const reports = await Report.find();
        console.log(reports);

        return res.json(reports);
    } catch (err) {
        console.error(`Could not get reports ${err.message}`);
        return res.status(500).json({ error: `Could not get reports ${err.message}` });
    }
};

exports.getReportById = async (req, res) => {
    const { id } = req.params;
    try {
        const report = await Report.findById(id);
        console.log(report);

        return res.json(report);
    } catch (err) {
        console.error(`Could not get report by id ${err.message}`);
        return res.status(500).json({ error: `Could not get report by id ${err.message}` });
    }
};
