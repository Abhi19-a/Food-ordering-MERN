import express from "express";
import Stripe from "stripe";
import Order from "../models/Order.js";

const router = express.Router();

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// POST /api/payment/create-checkout-session
// Creates a Stripe Checkout session
router.post("/create-checkout-session", async (req, res) => {
    try {
        const { items, successUrl, cancelUrl } = req.body;

        if (!items || items.length === 0) {
            return res.status(400).json({ error: "No items provided" });
        }

        // Create line items for Stripe
        const lineItems = items.map(item => ({
            price_data: {
                currency: "inr",
                product_data: {
                    name: item.name,
                    description: item.category || "Food item",
                    images: item.imageUrl ? [item.imageUrl] : []
                },
                unit_amount: Math.round(item.price * 100) // Stripe expects amount in paise
            },
            quantity: item.quantity
        }));

        // Calculate total
        const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderId = `ORD-${Date.now()}`;

        // Create order in database
        const order = new Order({
            orderId,
            stripeSessionId: null, // Will update after session creation
            items,
            amount: total,
            status: "pending"
        });
        await order.save();

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: lineItems,
            mode: "payment",
            success_url: successUrl || `${process.env.FRONTEND_URL}/orders?success=true&orderId=${orderId}`,
            cancel_url: cancelUrl || `${process.env.FRONTEND_URL}/cart?cancelled=true`,
            metadata: {
                orderId
            }
        });

        // Update order with session ID
        order.stripeSessionId = session.id;
        await order.save();

        res.json({
            success: true,
            sessionId: session.id,
            url: session.url,
            orderId
        });
    } catch (err) {
        console.error("Error creating checkout session:", err);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

// POST /api/payment/webhook
// Stripe webhook to handle payment events
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
            event = req.body;
        }
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
        case "checkout.session.completed":
            const session = event.data.object;

            // Update order status to paid
            await Order.findOneAndUpdate(
                { stripeSessionId: session.id },
                {
                    status: "paid",
                    stripePaymentId: session.payment_intent
                }
            );
            console.log("Payment completed for session:", session.id);
            break;

        case "checkout.session.expired":
            const expiredSession = event.data.object;
            await Order.findOneAndUpdate(
                { stripeSessionId: expiredSession.id },
                { status: "expired" }
            );
            break;

        default:
            console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
});

// GET /api/payment/verify/:sessionId
// Verify payment status
router.get("/verify/:sessionId", async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const order = await Order.findOne({ stripeSessionId: sessionId });

        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        // Update order if payment succeeded
        if (session.payment_status === "paid" && order.status !== "paid") {
            order.status = "paid";
            order.stripePaymentId = session.payment_intent;
            await order.save();
        }

        res.json({
            success: session.payment_status === "paid",
            status: session.payment_status,
            orderId: order.orderId,
            order
        });
    } catch (err) {
        console.error("Error verifying payment:", err);
        res.status(500).json({ error: "Failed to verify payment" });
    }
});

// GET /api/payment/orders
// Get all paid orders
router.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find({ status: "paid" })
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(orders);
    } catch (err) {
        console.error("Error fetching orders:", err);
        res.status(500).json({ error: "Failed to fetch orders" });
    }
});

export default router;
