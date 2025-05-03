const express = require("express");
const bcrypt = require("bcrypt");
const axios = require("axios");
const db = require("../models/db");
const { sendEmail } = require("../handlers/mailHandler");
const { generateTelegramInviteLink } = require("../handlers/webhookHandlers");
const router = express.Router();

const NOWPAYMENTS_API_KEY = process.env.NOWPAYMENTS_API_KEY;
const NOWPAYMENTS_API_URL = "https://api.nowpayments.io/v1/invoice";
router.post("/create-checkout-session", async (req, res) => {
    const { email, password } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "subscription",
            line_items: [
                {
                    price: "price_1RDaQTDwIDDdMRawNl5J3Ig6",
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
                    price: "price_1RDaQTDwIDDdMRawNl5J3Ig6",
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: successUrl,
            cancel_url: cancelUrl,
            metadata: {
                email: email,
                userId: userId, // Pass user ID to metadata for webhook
                type: "subscription",
            },
        });

        res.status(200).json({ email: email, sessionId: session.id });
    } catch (error) {
        console.error("Error creating Stripe session:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/checkout-one-time", async (req, res) => {
    const { email, password } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment", // one-time
            line_items: [
                {
                    price: "price_1RJfCJDwIDDdMRawzIbqBpkW", // replace with your one-time price
                    quantity: 1,
                },
            ],
            metadata: {
                email,
                password,
                type: "one-time",
            },
            success_url: "https://ggbp.org.uk/login",
            cancel_url: "https://ggbp.org.uk/",
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating one-time session:", error.message);
        res.status(500).json({ message: "Failed to create one-time session" });
    }
});

router.post("/checkout-one-to-one", async (req, res) => {
    const { email, password } = req.body;

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            mode: "payment", // one-time
            line_items: [
                {
                    price: "price_1RJi4mDwIDDdMRaw9yuRQkXz", // Replace with your Stripe price ID for £2500 1-1
                    quantity: 1,
                },
            ],
            metadata: {
                email,
                password,
                type: "one-to-one",
            },
            success_url: "https://ggbp.org.uk/login",
            cancel_url: "https://ggbp.org.uk/",
        });

        res.json({ url: session.url });
    } catch (error) {
        console.error("Error creating 1-1 session:", error.message);
        res.status(500).json({ message: "Failed to create 1-1 session" });
    }
});

router.post("/crypto-payment", async (req, res) => {
    const { email, password, paymentType } = req.body;

    if (!email || !password || !paymentType) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    if (paymentType === "subscription") {
        return res
            .status(400)
            .json({ message: "Crypto not supported for subscriptions." });
    }

    try {
        const priceAmount =
            paymentType === "one-to-one"
                ? 2500
                : paymentType === "one-time"
                  ? 1000
                  : null;

        if (!priceAmount) {
            return res.status(400).json({ message: "Invalid payment type." });
        }

        const orderId = `user_${email}_${Date.now()}`;

        const response = await axios.post(
            NOWPAYMENTS_API_URL,
            {
                price_amount: priceAmount,
                price_currency: "usd",
                pay_currency: "usdttrc20",
                ipn_callback_url: `${process.env.BASE_URL}/webhook/nowpayments`,
                success_url: `${process.env.BASE_URL}/login`,
                cancel_url: `${process.env.BASE_URL}/subscribe/cancel`,
                order_id: orderId,
                is_fixed_rate: true,
                underpaid_cover: true,
                metadata: JSON.stringify({ email, password, paymentType }),
            },
            {
                headers: {
                    "x-api-key": NOWPAYMENTS_API_KEY,
                    "Content-Type": "application/json",
                },
            }
        );

        res.status(200).json({ url: response.data.invoice_url });
    } catch (error) {
        console.error(
            "NOWPayments error:",
            error.response?.data || error.message
        );
        res.status(500).json({
            message: "Failed to create NOWPayments invoice.",
        });
    }
});

router.post("/webhook/nowpayments", async (req, res) => {
    const payload = req.body;
    const receivedHmac = req.headers["x-nowpayments-sig"];

    const computedHmac = crypto
        .createHmac("sha512", IPN_SECRET)
        .update(JSON.stringify(payload))
        .digest("hex");

    if (receivedHmac !== computedHmac) {
        console.warn("Invalid IPN signature.");
        return res.status(403).end();
    }

    const { payment_status, order_id, payment_id, metadata } = payload;

    if (payment_status !== "finished" || !metadata || !order_id)
        return res.status(400).end();

    let parsed;
    try {
        parsed = JSON.parse(metadata);
    } catch {
        return res.status(400).end();
    }

    const { email, password, paymentType } = parsed;
    if (!email || !paymentType) return res.status(400).end();

    try {
        const existingUser = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        let userId;

        if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
        } else {
            const hashedPassword = await bcrypt.hash(password, 10);
            const newUser = await db.query(
                "INSERT INTO users (email, password, is_admin) VALUES ($1, $2, $3) RETURNING id",
                [email, hashedPassword, false]
            );
            userId = newUser.rows[0].id;
        }

        await db.query(
            `INSERT INTO subscriptions (user_id, stripe_subscription_id, status, type, source, txid)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, `now_${payment_id}`, true, paymentType, "crypto", null]
        );

        const inviteLink = await generateTelegramInviteLink();
        const text = `Welcome to GGBP! You now have full course access. Join our Telegram channel: ${inviteLink}`;

        await sendEmail(
            email,
            "GGBP Telegram Access",
            text,
            `<p>${text}</p><a href="${inviteLink}">${inviteLink}</a>`
        );

        res.status(200).end();
    } catch (err) {
        console.error("NOWPayments webhook error:", err.message);
        res.status(500).end();
    }
});

module.exports = router;
