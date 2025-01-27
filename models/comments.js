const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    authorName: { type: String, required: true },
    authorEmail: { type: String, required: true },
    authorPicture: { type: String, required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    content: { type: String, default: '' }, // Nội dung comment (không bắt buộc)
    rating: { type: Number, min: 1, max: 5, default: null }, // Đánh giá sao, 1 - max 5
    createdAt: { type: String, default: new Date().toUTCString() },
    replies: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], // rep commm list
    updatedAt: { type: String, default: null },
    detailedRatings: {
        workEnvironment: { type: Number, default: null },
        trainingSupport: { type: Number, default: null },
        learningOpportunities: { type: Number, default: null },
        benefits: { type: Number, default: null },
      },
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;