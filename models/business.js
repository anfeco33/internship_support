



// tạm thời chưa cần vì chỉ cần show list company


///
///
///
///
///
// const fs = require('fs');
// const path = require('path');
// const mongoose = require('mongoose');
// const Schema = mongoose.Schema;

// const BusinessSchema = new Schema({
//     //khóa liên kết
//     companyID: { type: Schema.Types.ObjectId, ref: 'User' }, //id của actor công ty
//     businessName: { type: String, required: true }, // tên hồ sơ doanh nghiệp
//     businessPrice: { type: Number, required: true, default: 0 },
//     businessCategory: { type: String, required: true },
//     businessPreview: { type: String, required: true },
//     businessPromotionVideo: { type: String },
//     businessImage: { type: String, required: true },
//     businessDescription: { type: String, required: true },
//     businessAudience: { type: String, required: true },
//     businessResult: { type: [String], default: [] },
//     businessRequirement: { type: [String], default: [] },
//     reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }],

//     createdAt: { type: String, default: new Date().toUTCString() }
// });

// BusinessSchema.add({
//     exercises: [{ type: Schema.Types.ObjectId, ref: 'Exercise' }]
// });

// const Business = mongoose.model('Business', BusinessSchema);

// module.exports = Business;
