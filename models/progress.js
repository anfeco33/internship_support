const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { timeStamp } = require('console');
const Schema = mongoose.Schema;

const progressSchema = new Schema({
    userID: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    lectureID: { type: Schema.Types.ObjectId, ref: 'Lecture', required: true },
    courseID: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    progress: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    createdAt: { type: String, default: new Date().toUTCString() }
});

const Progress = mongoose.model('Progress', progressSchema);

module.exports = Progress;
