const User = require('./users');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const instructorSchema = new Schema({
    // TODO: Các trường chỉ có giảng viên có
    access: [
        { access: { type: String, required: true }, icon: { type: String, required: true } }
    ],
    courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    major: { type: String, required: false },
    technique: { type: String, required: false }
});

const Instructor = User.discriminator('Instructor', instructorSchema);

module.exports = Instructor;
