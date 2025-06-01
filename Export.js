// routes/export.js
const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Report = require('../models/Report'); // Adjust path if needed
const authenticateToken = require('../middleware/authenticateToken'); // JWT middleware

// PDF Export
router.get('/pdf', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find().sort({ date: -1 });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=report.pdf');
    doc.pipe(res);

    reports.forEach((report, i) => {
      doc.fontSize(14).text(`Report ${i + 1}`, { underline: true });
      doc.fontSize(10).text(`Date: ${report.date}`);
      doc.text(`Factory: ${report.factory}`);
      doc.text(`Machine: ${report.machineNumber}`);
      doc.text(`Shift: ${report.shift}`);
      doc.text(`Product Type: ${report.productType}`);
      doc.text(`OEE: ${report.oee}`);
      doc.text('---------------------------');
    });

    doc.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate PDF' });
  }
});

// Excel Export
router.get('/excel', authenticateToken, async (req, res) => {
  try {
    const reports = await Report.find().sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Reports');

    worksheet.columns = [
      { header: 'Date', key: 'date' },
      { header: 'Factory', key: 'factory' },
      { header: 'Machine', key: 'machineNumber' },
      { header: 'Product Type', key: 'productType' },
      { header: 'Shift', key: 'shift' },
      { header: 'OEE', key: 'oee' },
    ];

    reports.forEach(report => {
      worksheet.addRow({
        date: report.date,
        factory: report.factory,
        machineNumber: report.machineNumber,
        productType: report.productType,
        shift: report.shift,
        oee: report.oee,
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=report.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate Excel file' });
  }
});

module.exports = router;
