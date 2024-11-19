const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const transactionSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    email: { type: String, required: true},
    cardOwner: { type: String, required: true }, // Cần tên chủ thẻ theo luật nhà nước VN
    courseIds: [{ type: Schema.Types.ObjectId, ref: 'Course', required: true }],
    amountPaid: { type: Number, required: true },
    transactionDate: { type: String, default: new Date().toUTCString()},
    paymentMethod: { type: String, required: true },
    status: { type: String, enum: ['success', 'failed'], required: true },
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
