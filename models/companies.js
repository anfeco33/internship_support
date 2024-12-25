const User = require('./users');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Mô hình dữ liệu cho công ty khác user company
const companySchema = new Schema({
    // updatedAt: { type: Date, default: Date.now }, // Ngày cập nhật hồ sơ công ty
    representativeId: { type: Schema.Types.ObjectId, ref: 'User', required: true }, // ID người đại diện
    name: { type: String, default: '' },
    isProfileUpdated: { type: Boolean, default: false }, // Đánh dấu đã cập nhật hồ sơ
    industry: { type: String, default: '' },
    size: { type: String, default: '' },
    address: { type: String, default: '' },
    website: { type: String, default: '' },
    profile: { type: String, default: '' },
    contactEmail: { type: String, default: '' },
    phoneNumber: { type: String, default: '' },
    promotionVideos: [{ type: String }],
    documents: [{ type: String }], // document file paths
    images: [{ type: String }],
    createdAt: { type: Date, default: new Date().toUTCString() },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: [106.660172, 10.762622] }, // [lng, lat]
    },

    // // Mô tả và thông tin bổ sung
    profile: { type: String , default: '' }, // Mô tả công ty gồm văn hóa, project (tùy)

    // Cơ hội thực tập và việc làm
    internships: [{ type: Schema.Types.ObjectId, ref: 'Job' }], // Danh sách cơ hội thực tập
    openings: [{ type: Schema.Types.ObjectId, ref: 'Job' }], // Các vị trí tuyển dụng hiện tại

    reviews: [{ type: Schema.Types.ObjectId, ref: 'Review' }], // Danh sách đánh giá
    averageRating: { type: Number, default: 0 }, // Điểm đánh giá trung bình
    ratings: {
        workEnvironment: { type: Number, default: 0 }, // Môi trường làm việc
        trainingSupport: { type: Number, default: 0 }, // Hỗ trợ thực tập sinh
        learningOpportunities: { type: Number, default: 0 }, // Cơ hội học hỏi
        benefits: { type: Number, default: 0 } // Phúc lợi
    },
    isVerified: { type: Boolean, default: false }, // Công ty đã được xác minh chưa
    isLocked: { type: Boolean, default: false }, // profile công ty không được hiển thị lên website

});

const Company = mongoose.model('Company', companySchema);
module.exports = Company;
