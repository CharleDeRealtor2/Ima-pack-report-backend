require('dotenv').config(); // Load .env variables

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

// Connect to MongoDB
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection failed:', err));

/* ======= MODELS ======= */

// User schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Report schema
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

/* ======= MIDDLEWARE ======= */

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ msg: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ msg: 'Invalid or expired token' });
  }
};

/* ======= ROUTES ======= */

// REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { fullName, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const newUser = new User({ fullName, email, password: hashed });
    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, fullName: user.fullName });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// SUBMIT REPORT (protected)
app.post('/submit-report', verifyToken, async (req, res) => {
  try {
    const report = new Report(req.body);
    await report.save();
    res.status(201).json({ message: 'Report saved successfully' });
  } catch (error) {
    console.error('Error saving report:', error);
    res.status(500).json({ error: 'Failed to save report' });
  }
});

// Export routes if needed
// const exportRoutes = require('./routes/export');
// app.use('/export', exportRoutes);

/* ======= START SERVER ======= */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
