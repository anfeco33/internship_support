const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { timeStamp } = require('console');
const Schema = mongoose.Schema;

const noteSchema = new Schema({
    //khóa liên kết
    lectureID: { type: Schema.Types.ObjectId, ref: 'Lecture' },
    userID: { type: Schema.Types.ObjectId, ref: 'User' },

    noteTimeStamp: { type: String, required: true },
    noteDescription: { type: String, required: true },

    createdAt: { type: String, default: new Date().toUTCString() }
});

const Note = mongoose.model('Note', noteSchema);

module.exports = Note;