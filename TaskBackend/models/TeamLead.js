// models/TeamLead.js

const mongoose = require('mongoose');

const teamLeadSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    team: {
        type: String,
        required: true
    },
    experience: {
        type: Number, // Storing as a number allows for easier calculations
        required: true
    },
    salary: {
        type: Number, // Storing as a number is best practice
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        required: true
    },

    // Add fields specific to a team lead
    certifications: {
        type: [String],
        default: []
    },
    leadershipExperience: {
        type: Number,
        default: 0
    }
});

const TeamLead = mongoose.model('TeamLead', teamLeadSchema);

module.exports = TeamLead;