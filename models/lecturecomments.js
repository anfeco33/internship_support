const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lectureID: { type: Schema.Types.ObjectId, ref: 'Lecture', required: true },
    comment: { type: String, required: false },
    createdAt: { type: String, default: new Date().toUTCString() },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;