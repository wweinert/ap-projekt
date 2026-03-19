const Report = require("../models/Report");

exports.createReport = async (req, res) => {
    try {
        const { title, description, status } = req.body;
        const { supplierId } = req.params;

        const report = await Report.create({
            title,
            description,
            status,
            supplierId,
            createdAt: new Date().toISOString(),
        });

        return res.json(report);
    } catch (err) {
        console.error(`Could not create a report ${err.message}`);
        return res.status(500).json({ error: `Could not create a report ${err.message}` });
    }
};

exports.getByAllSupplierId = async (req, res) => {
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

exports.updateById = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, status } = req.body;

        const updatedReport = await Report.findByIdAndUpdate(id, {
            title,
            description,
            status,
        });

        console.log(updatedReport);

        if (!updatedReport) {
            return res.status(404).json({ error: "Report not found" });
        }

        return res.status(200).json(updatedReport);
    } catch (err) {
        console.error(`Could not update a report ${err.message}`);
        return res.status(500).json({ error: `Could not update a report ${err.message}` });
    }
};

exports.deleteById = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedReport = await Report.findByIdAndDelete(id);
        console.log(deletedReport);

        if (!deletedReport) {
            return res.status(404).json({ error: "Report not found" });
        }

        return res.status(200).json(deletedReport);
    } catch (err) {
        console.error(`Could not delete a report ${err.message}`);
        return res.status(500).json({ error: `Could not delete a report ${err.message}` });
    }
};
