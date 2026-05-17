const mongoose = require('mongoose');

const ProblemSchema = new mongoose.Schema({
    userId: String,
    companyId: String,
    description: { type: String, required: true },
    type: String,
    severity: { type: String, enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] },
    confidence: Number,
    solution: String,
    status: { type: String, default: 'DETECTED' },
    fixApplied: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Problem', ProblemSchema);

