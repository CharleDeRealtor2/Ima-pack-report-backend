const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  date: String,
  factory: String,
  machineNumber: String,
  productType: String,
  shift: String,

  hourlyReadings: [{
    time: String,
    machineCounter: String,
    runtime: String,
    speed: String,
    avgWeightBefore: String,
    avgWeightAfter: String,
  }],

  issues: [{
    description: String,
    whatWasDone: String,
    startTime: String,
    endTime: String,
    totalDowntime: String,
    repairRequired: String,
    comment: String,
    technician: String,
  }],

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

module.exports = mongoose.model('Report', reportSchema);
