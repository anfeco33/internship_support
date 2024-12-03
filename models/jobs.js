const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const JobSchema = new Schema({
    company: { type: Schema.Types.ObjectId, ref: 'Company', required: true }, // Công ty đăng tuyển
    title: { type: String, required: true },
    description: { type: String, required: true },
    requirements: [{ type: String }], // Danh sách yêu cầu
    applicationLink: { type: String, default: '' }, // Link nộp CV
    createdAt: { type: String, default: new Date().toUTCString() },
    updatedAt: { type: Date, default: new Date().toUTCString() }
});

module.exports = mongoose.model('Job', JobSchema);