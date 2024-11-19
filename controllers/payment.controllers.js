const stripe = require("stripe")(process.env.STRIPE_SECRET);
const User = require('../models/users');
const Course = require('../models/courses');
const Transaction = require('../models/transactions');

exports.processPayment = async (req, res, next) => {
    const courseId = req.body.courseId;
    const user = await User.findById(req.session.account);

    if (!user) {
        return res.status(404).json({ success: false, message: "User not found!" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
        return res.status(404).json({ success: false, message: "Course not found!" });
    }
    
    // Kiểm tra xem khóa học đã tồn tại trong các khóa học đã đăng ký chưa
    if (user.subscribed.includes(courseId)) {
        return res.json({ success: true, message: "You've already bought this course" });
    }

    const totalAmount = course.coursePrice;

    try {
        const customer = await stripe.customers.create({
            email: user.email,
            name: req.body.cardOwner,
        });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'vnd',
            description: 'Paynow a course',
            customer: customer.id,
            payment_method: req.body.paymentMethodId,
            off_session: true,
            confirm: true
        });

        // Tạo model hóa đơn
        const newTransaction = new Transaction({
            userId: user._id,
            email: user.email,
            cardOwner: req.body.cardOwner,
            courseIds: req.body.courseId,
            amountPaid: totalAmount,
            paymentMethod: req.body.paymentMethodId,
            status: 'success'
        });
        await newTransaction.save();

        // Cập nhật thông tin người dùng
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { $push: { subscribed: courseId }, $pull: { cart: courseId } }, // Thêm vào subscribed và xóa khỏi cart
            { new: true }
        );

        res.json({ success: true, clientSecret: paymentIntent.client_secret, message: "Payment processed and course added to your profile!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
};

exports.cartPaymentProcess = async (req, res, next) => {
    const subscribedCourses = await User.findById(req.session.account);
    const userId = req.session.account
    const user = await User.findById(userId).populate('cart', 'courseName coursePrice');
    const cartCourses = user.cart;

    if (!user) {
        return res.json({ success: false, message: "Courses not found!" });
    }

    // Kiểm tra xem các khóa học muốn mua đã tồn tại trong các khóa học đã đăng ký chưa
    if (subscribedCourses.subscribed.includes(cartCourses.map(course => course._id))) {
        return res.json({ success: true, message: "You've already bought these courses" });
    }

    totalAmount = cartCourses.reduce((total, course) => total + course.coursePrice, 0)

    try {
        const customer = await stripe.customers.create({
            email: user.email,
            name: req.body.cardOwner,
        });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: totalAmount,
            currency: 'vnd',
            description: 'Payment for courses',
            customer: customer.id,
            payment_method: req.body.paymentMethodId,
            off_session: true,
            confirm: true
        });

        //Tạo model hóa đơn
        const newTransaction = new Transaction({
            userId: user._id,
            email: user.email,
            cardOwner: req.body.cardOwner,
            courseIds: cartCourses.map(course => course._id),
            amountPaid: totalAmount,
            paymentMethod: req.body.paymentMethodId,
            status: 'success'
        });
        await newTransaction.save();

        await User.findByIdAndUpdate(
            user._id,
            { $push: { subscribed: cartCourses.map(course => course._id) } },
            { new: true }
        );
        //clear cart
        await User.findByIdAndUpdate(
            user._id,
            { $set: { cart: [] } },
            { new: true }
        );

        res.json({ success: true, clientSecret: paymentIntent.client_secret, message: "Payment processed and courses added to your profile!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
    }
}
