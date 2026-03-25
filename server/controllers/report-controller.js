const Report = require("../models/Report");
const Supplier = require("../models/Supplier");
const User = require("../models/User");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");
const ejs = require("ejs");

exports.createReport = async (req, res) => {
    try {
        const { title, description = "", status, supplierId } = req.body;

        if (!title || !status || !supplierId) {
            return res.status(400).json({ error: "title, status und supplierId sind erforderlich" });
        }

        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(401).json({ message: "Benutzer nicht gefunden" });
        }

        const supplier = await Supplier.findById(supplierId);
        if (!supplier) return res.status(404).json({ error: "Supplier not found" });

        const uploadedImages = Array.isArray(req.files) ? req.files.map((file) => `/uploads/reports/images/${file.filename}`) : [];

        const report = await Report.create({
            title: title.trim(),
            description: description.trim(),
            supplierId,
            status,
            images: uploadedImages,
            createdByUserId: user._id,
            createdByName: user.name,
            createdByEmail: user.email,
            createdAt: new Date().toISOString(),
        });

        return res.status(201).json(report);
    } catch (err) {
        console.error(`Could not create a report ${err.message}`);
        return res.status(500).json({ error: `Could not create a report ${err.message}` });
    }
};

exports.getAllBySupplierId = async (req, res) => {
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
        const { title, description, status, updateNotes, supplierId, updatedByEmail } = req.body;

        const updatedReport = await Report.findByIdAndUpdate(
            id,
            {
                title,
                description,
                status,
                updateNotes,
                supplierId,
                updatedByEmail,
            },
            { new: true, runValidators: true },
        );

        if (!updatedReport) return res.status(404).json({ error: "Report not found" });

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

exports.generatePdfById = async (req, res) => {
    try {
        const { id } = req.params;

        const report = await Report.findById(id);
        if (!report) return res.status(404).json({ error: "Report not found" });

        const supplier = await Supplier.findById(report.supplierId);
        if (!supplier) return res.status(404).json({ error: "Supplier not found" });

        const templatePath = path.join(__dirname, "../templates/report.ejs");

        const html = await ejs.renderFile(templatePath, {
            report,
            supplier,
            // path,
        });

        const pdfDir = path.join(__dirname, `../uploads/reports/${report._id}/pdfs`);
        if (!fs.existsSync(pdfDir)) fs.mkdirSync(pdfDir, { recursive: true });

        const pdfPath = path.join(pdfDir, `report_${report._id}.pdf`);

        const browser = await puppeteer.launch({
            args: ["--no-sandbox", "--disable-setuid-sandbox"],
            headless: true,
        });

        const page = await browser.newPage();
        await page.setContent(html, { waitUntil: "networkidle0" });
        await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
        await browser.close();

        return res.download(pdfPath, `report_${report._id}.pdf`);
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: "could not create PDF" });
    }
};
