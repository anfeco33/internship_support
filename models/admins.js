const User = require('./users');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const adminSchema = new Schema({
    access: [
        { access: { type: String, required: true }, icon: { type: String, required: true } }
    ]
});

const Admin = User.discriminator('Admin', adminSchema);

module.exports = Admin;
