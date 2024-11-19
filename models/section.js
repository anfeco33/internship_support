const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const sectionSchema = new Schema({
    //khóa liên kết
    courseID: { type: Schema.Types.ObjectId, ref: 'Course' },
    
    sectionNumber: { type: String, required: true },
    sectionTitle: { type: String, required: true },

    createdAt: { type: String, default: new Date().toUTCString() }
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
