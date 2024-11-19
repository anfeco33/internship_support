const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const courseSchema = new Schema({
    //khóa liên kết
    instructorID: { type: Schema.Types.ObjectId, ref: 'User' },
    courseName: { type: String, required: true },
    coursePrice: { type: Number, required: true, default: 0 },
    courseCategory: { type: String, required: true },
    coursePreview: { type: String, required: true },
    courseImage: { type: String, required: true },
    courseDescription: { type: String, required: true },
    courseAudience: { type: String, required: true },
    courseResult: { type: [String], default: [] },
    courseRequirement: { type: [String], default: [] },
    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],

    createdAt: { type: String, default: new Date().toUTCString() }
});

courseSchema.add({
    exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }]
});

const Course = mongoose.model('Course', courseSchema);

module.exports = Course;
