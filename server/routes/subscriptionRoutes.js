const express = require("express");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const db = require("../models/db");
const router = express.Router();
router.post("/create-checkout-session", async (req, res) => {
    const { email, password } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price: "price_1QXRGADwIDDdMRawdBXA9c6u",
                    quantity: 1,
                },
            ],
            metadata: {
                email,
                password,
            },
            success_url: "https://ggbp.org.uk/login",
            cancel_url: "https://ggbp.org.uk/",
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: "Failed to create checkout session" });
    }
});

router.post("/unsubscribe", async (req, res) => {
    const { userId } = req.body;

    try {
        // Fetch user subscription details
        const user = await db.query(
            "SELECT stripe_subscription_id FROM users WHERE id = $1",
            [userId]
        );
        if (!user.rows.length || !user.rows[0].stripe_subscription_id) {
            return res
                .status(404)
                .json({ message: "User subscription not found" });
        }

        const subscriptionId = user.rows[0].stripe_subscription_id;

        // Cancel the Stripe subscription
        await stripe.subscriptions.update(subscriptionId, {
            cancel_at_period_end: true,
        });

        // Update the user's subscription status in the database
        await db.query(
            "UPDATE subscriptions SET status = false WHERE user_id = $1",
            [userId]
        );

        res.status(200).json({ message: "Unsubscribed successfully" });
    } catch (error) {
        console.error("Error unsubscribing:", error.message);
        res.status(500).json({ message: "Failed to unsubscribe" });
    }
});

router.post("/resubscribe-session", async (req, res) => {
    const { email, successUrl, cancelUrl } = req.body;

    try {
        // Retrieve userId from the database based on email
        const user = await db.query("SELECT id FROM users WHERE email = $1", [
            email,
        ]);

        if (user.rows.length === 0) {
            return res
                .status(404)
                .json({ message: "No user found with this email." });
        }

        const userId = user.rows[0].id;
        const userSubscription = await db.query(
            "SELECT status FROM subscriptions WHERE user_id = $1",
            [userId]
        );

        if (
            userSubscription.rows.length > 0 &&
            userSubscription.rows[0].status === true
        ) {
            return res.status(400).json({
                message: "You are already subscribed to the course.",
            });
        }

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: [
                {
                    price: "price_1QXRGADwIDDdMRawdBXA9c6u", // Replace with your price ID
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                email: email,
                userId: userId, // Pass user ID to metadata for webhook
            },
        });

        res.status(200).json({ email: email, sessionId: session.id });
    } catch (error) {
        console.error("Error creating Stripe session:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;
