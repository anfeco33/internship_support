const User = require('./users');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const studentSchema = new Schema({
    // TODO: Các trường chỉ có student có
    access: [
        { access: { type: String, required: true }, icon: { type: String, required: true } }
    ]
});

const Student = User.discriminator('Student', studentSchema);

module.exports = Student;
