const mongoose = require('mongoose');
const Schema = mongoose.Schema;
 // Cơ hội thực tập và việc làm
const internshipSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: Schema.Types.ObjectId, ref: 'Company' },
  applications: [{ type: Schema.Types.ObjectId, ref: 'Application' }],
  createdAt: { type: Date, default: new Date().toUTCString() }
});

module.exports = mongoose.model('Internship', internshipSchema);