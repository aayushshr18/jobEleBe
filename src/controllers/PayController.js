const Razorpay = require("razorpay");
const crypto = require("crypto");
const dotenv = require("dotenv");
const User = require("../model/UserAuth");

dotenv.config();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder = async (req, res) => {
    try {
        const { amount } = req.body;
        const user=await User.findById(req.user.id);

        let totalAmount;

        if (user.profileType === "user") {
            totalAmount = 149 * 1.18*100; // ₹149 + 18% GST
        } else if (user.profileType === "employer") {
            totalAmount = amount * 1.18*100; // Custom amount + 18% GST
            if (totalAmount < 300 * 1.18*100) {
                return res.status(400).json({ error: "Minimum recharge is ₹300 + GST" });
            }
        } else {
            return res.status(400).json({ error: "Invalid profile type" });
        }

        const options = {
            amount: Math.round(totalAmount),
            currency: "INR",
            receipt: `order_rcptid_${Date.now()}`
        };

        const order = await razorpay.orders.create(options);
        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.verifyPayment = async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, amount } = req.body;
    const user=await User.findById(req.user.id);
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body)
        .digest("hex");

    /*if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ error: "Payment verification failed" });
    }*/

    try {

        if (user.profileType === "user") {
            user.expiry = new Date();
            user.expiry.setMonth(user.expiry.getMonth() + 1); // Extend by one month
        } else if (user.profileType === "employer") {
            user.balance += Number(amount)/118; // Store only the base amount (without GST)
        }

        await user.save();

        res.json({ success: true, payment_id: razorpay_payment_id, user });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
