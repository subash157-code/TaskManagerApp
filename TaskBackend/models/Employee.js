const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['Employee', 'Team Lead']
  },
  team: {
    type: String,
    required: true
  },
  experience: {
    type: String,
    // Required only for Team Leads, so we don't set a required validator here
  },
  salary: {
    type: String,
    // Required only for Team Leads
  },
  mobile: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('Employee', employeeSchema);