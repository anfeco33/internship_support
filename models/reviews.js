const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: false },
    createdAt: { type: String, default: new Date().toUTCString() },
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;