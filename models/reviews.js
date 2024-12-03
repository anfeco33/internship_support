const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// bình luận sv
const reviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    // courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
    ratings: {
        workEnvironment: { type: Number, default: 0 }, // Môi trường làm việc
        trainingSupport: { type: Number, default: 0 }, // Hỗ trợ thực tập sinh
        learningOpportunities: { type: Number, default: 0 }, // Cơ hội học hỏi
        benefits: { type: Number, default: 0 } // Phúc lợi
    },
    comment: { type: String, required: true }, // Bình luận chi tiết
    createdAt: { type: String, default: new Date().toUTCString() },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;