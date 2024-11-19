const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const lectureSchema = new Schema({
    //khóa liên kết
    sectionID: { type: Schema.Types.ObjectId, ref: 'Section' },
    
    lectureTitle: { type: String, required: true },
    lectureLink: { type: String, required: true },
    lectureDescription: { type: String, required: true },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],

    createdAt: { type: String, default: new Date().toUTCString() }
});

const Lecture = mongoose.model('Lecture', lectureSchema);

module.exports = Lecture;
