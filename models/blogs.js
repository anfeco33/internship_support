const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // Người viết bài
    title: { type: String, required: true },
    content: { type: String, required: true },
    tags: [{ type: String }], // Các thẻ liên quan
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blog', BlogSchema);
