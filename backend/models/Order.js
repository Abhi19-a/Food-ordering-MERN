import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  stripeSessionId: {
    type: String,
    default: null
  },
  stripePaymentId: {
    type: String,
    default: null
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
    enum: ["pending", "paid", "failed", "expired"],
    default: "pending"
  },
  customerEmail: String,
  customerPhone: String,
  customerName: String
}, {
  timestamps: true
});

const Order = mongoose.model("Order", orderSchema);

export default Order;
