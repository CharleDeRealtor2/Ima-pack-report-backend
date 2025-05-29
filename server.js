// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(
  'mongodb+srv://Promasidor:<PROM-HEATFACTORY>@cluster0.lfkkhnu.mongodb.net/imaPackReport?retryWrites=true&w=majority&appName=Cluster0',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
).then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection failed:', err));

// Mongoose Schema
const reportSchema = new mongoose.Schema({
  date: String,
  factory: String,
  machineNumber: String,
  productType: String,
  shift: String,

  hourlyReadings: [
    {
      time: String,
      machineCounter: String,
      runtime: String,
      speed: String,
      avgWeightBefore: String,
      avgWeightAfter: String,
    }
  ],

  issues: [
    {
      description: String,
      whatWasDone: String,
      startTime: String,
      endTime: String,
      totalDowntime: String,
      repairRequired: String,
      comment: String,
      technician: String,
    }
  ],

  totalRuntime: String,
  totalDowntime: String,
  oee: String,
  availabilityRate: String,
  performanceRate: String,
  qualityRate: String,
  totalCounterReading: String,
  imaReelWaste: String,
  imaRejectedReel: String,

  operatorFirstName: String,
  operatorLastName: String,
  incomingFirstName: String,
  incomingLastName: String
});

const Report = mongoose.model('Report', reportSchema);

// POST route to receive form data
app.post('/submit-report', async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json({ message: 'Report saved successfully' });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
