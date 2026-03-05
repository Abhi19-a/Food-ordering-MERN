import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  items: [{
    id: String,
    name: String,
    price: Number,
    quantity: Number,
    category: String,
    imageUrl: String
  }],
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "INR"
  },
  status: {
    type: String,
    enum: ["pending", "paid", "failed", "expired", "delivered"],
    default: "pending"
  },
  paymentMethod: {
    type: String,
    enum: ["Cash on Delivery", "Card Payment", "UPI Payment"],
    default: "Cash on Delivery"
  },
  transactionId: {
    type: String,
    default: null
  },
  customerEmail: String,
  customerPhone: String,
  customerName: String
}, {
  timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
