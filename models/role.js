const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const roleSchema = new Schema({
    username: { type: Schema.Types.ObjectId, ref: 'user' },
    role: { type: String, required: true , unique: true },
    permission: [{ type: String, required: true }],
});

const permission = mongoose.model('Permissions', roleSchema);

module.exports = permission;
