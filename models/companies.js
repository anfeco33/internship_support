const User = require('./users');
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const companySchema = new Schema({
    access: [
        { access: { type: String, required: true }, icon: { type: String, required: true } }
    ],
    // // courses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    // business: [{ type: Schema.Types.ObjectId, ref: 'Business' }],
    // major: { type: String, required: false },
    // technique: { type: String, required: false }

    // Thông tin cơ bản
    name: { type: String, required: true }, // Tên công ty
    logo: { type: String, ref: 'User' },
    industry: { type: String, required: true }, // Lĩnh vực hoạt động (ví dụ: IT, AI, Marketing)
    size: { type: String, enum: ['Small', 'Medium', 'Large'], default: 'Medium' }, // Quy mô công ty
    location: { type: String, required: true }, // Địa chỉ công ty
    website: { type: String, default: '' }, // Trang web công ty

    // Mô tả và thông tin bổ sung
    profile: { type: String, required: true }, // Mô tả chi tiết công ty
    culture: { type: String, default: '' }, // Văn hóa công ty
    projects: [{ type: String }], // Dự án tiêu biểu của công ty

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

    // Liên hệ và người đại diện
    representative: { type: Schema.Types.ObjectId, ref: 'User' }, // Người đại diện công ty
    contactEmail: { type: String, required: true }, // Email liên hệ
    phoneNumber: { type: String, required: true }, // Số điện thoại liên hệ

    // Hình ảnh và video
    images: [{ type: String }], // Danh sách URL hình ảnh công ty
    promotionVideos: [{ type: String }], // Danh sách URL video quảng bá

    // Thông tin quản trị
    isVerified: { type: Boolean, default: false }, // Công ty đã được xác minh chưa
    createdAt: { type: Date, default: Date.now }, // Ngày tạo hồ sơ công ty
    updatedAt: { type: Date, default: Date.now } // Ngày cập nhật hồ sơ công ty
});

const Company = User.discriminator('Company', companySchema);
module.exports = Company;
