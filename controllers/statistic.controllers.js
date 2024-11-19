
const Transaction = require('../models/transactions');

const jwt = require('jsonwebtoken');
const moment = require('moment');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

class StatisticalController {
    async getlistOrder() {
        try {
            // Xử lý lấy dữ liệu từ cơ sở dữ liệu
            const orders = await Transaction.find()
            .populate({
                path: 'userId',
                select: 'fullName'
            }).populate({
                path: 'courseIds',
                select: 'courseName coursePrice'
            });
            return orders;
        } catch (error) {
            // next(error);
            throw error;
        }
    }

    
    async getByTime(startDay, endDay) {
        try {
            // Lấy tất cả các đơn hàng từ cơ sở dữ liệu
            const allOrders = await Transaction.find({})
                .populate({
                    path: 'userId',
                    select: 'fullName',
                })
                .populate({
                    path: 'courseIds',
                    select: 'courseName coursePrice',
                });
    
            // Chuyển đổi startDay và endDay thành đối tượng Date nếu chúng là chuỗi
            const startDate = typeof startDay === 'string' ? new Date(startDay) : startDay;
            const endDate = typeof endDay === 'string' ? new Date(endDay) : endDay;
    
            // Lọc đơn hàng theo ngày từ startDay đến endDay (không quan trọng đến giờ, phút, giây)
            const filteredOrders = allOrders.filter(order => {
                const createdAtDate = new Date(order.transactionDate);
                const orderDate = new Date(createdAtDate.getFullYear(), createdAtDate.getMonth(), createdAtDate.getDate());
                const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
                const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
                return orderDate >= start && orderDate <= end;
            });
    
            return filteredOrders;
        } catch (error) {
            // Xử lý lỗi nếu có
        }
    }
    
}

module.exports = new StatisticalController();
