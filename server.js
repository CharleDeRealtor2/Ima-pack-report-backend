require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const exportRoutes = require('./routes/export');
const authToken = require('./middleware/authToken');
const Report = require('./models/Report');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CLIENT_ORIGIN,
  credentials: true
}));
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/export', exportRoutes);

// Protected Report Submission
app.post('/api/submit-report', authToken, async (req, res) => {
  try {
    const newReport = new Report(req.body);
    await newReport.save();
    res.status(201).json({ message: 'Report saved successfully' });
  } catch (err) {
    console.error('❌ Error saving report:', err);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

app.get('/', (req, res) => {
  res.send('IMA Pack Report API is running...');
});

app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
