const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
  internship: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  coverLetter: { type: String, required: true },
  appliedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Application', applicationSchema);