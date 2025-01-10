const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
  internship: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true },
  greeting: { type: String, required: true }, // for greeting message
  documents: [{ type: String }], // document file paths: cv, cover letter, portfolio, introduction letter, etc.
  appliedAt: { type: Date, default: new Date().toUTCString() },
  isViewed: { type: Boolean, default: false }, // để notification
  status: { type: String, enum: ['accepted', 'rejected'], default: null },
  responseMessage: { type: String, default: '' },
  isResponded: { type: Boolean, default: false } // phản hồi chưa?
});

module.exports = mongoose.model('Application', applicationSchema);