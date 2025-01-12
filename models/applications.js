const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const applicationSchema = new Schema({
  internship: { type: Schema.Types.ObjectId, ref: 'Internship', required: true },
  applicantId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  applicantName: { type: String, required: true },
  applicantEmail: { type: String, required: true }, //personal email
  greeting: { type: String, required: true }, // for greeting message
  documents: [{ type: String }], // document file paths: cv, cover letter, portfolio, introduction letter, etc.
  appliedAt: { type: Date, default: new Date().toUTCString() },
  isViewed: { type: Boolean, default: false }, // để notification cho company
  isViewedByStudent: { type: Boolean, default: false }, // để notification cho student
  status: { type: String, enum: ['accepted', 'rejected'], default: null },
  reasonOrMessage: { type: String, default: '' }, // lý do hoặc thông báo company
  isResponded: { type: Boolean, default: false }, // phản hồi chưa?
  responseAt: { type: Date, default: new Date().toUTCString() },
});

module.exports = mongoose.model('Application', applicationSchema);