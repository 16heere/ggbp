const bcrypt = require("bcrypt");
const db = require("../models/db");

async function handleCheckoutSessionCompleted(session) {
    const email = session.metadata.email;
    const password = session.metadata.password;

    const hashedPassword = await bcrypt.hash(password, 10);
    const stripeSubscriptionId = session.subscription;

    try {
        const existingUser = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        let userId;
        if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
        } else {
            const insertUserQuery =
                "INSERT INTO users (email, password, is_admin) VALUES ($1, $2, $3) RETURNING id";
            const userResult = await db.query(insertUserQuery, [
                email,
                hashedPassword,
                false,
            ]);
            userId = userResult.rows[0].id;
        }

        const insertSubscriptionQuery = `
            INSERT INTO subscriptions (user_id, stripe_subscription_id, status)
            VALUES ($1, $2, $3)
        `;
        await db.query(insertSubscriptionQuery, [
            userId,
            stripeSubscriptionId,
            true,
        ]);
        console.log(`User ${email} subscribed to course`);
    } catch (err) {
        console.error("Error handling course subscription:", err);
        throw new Error("Database operation failed");
    }
}

const handleStripeWebhook = async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (error) {
        console.error("Error verifying Stripe webhook:", error.message);
        return res.status(400).send(`Webhook error: ${error.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        if (session.mode === "subscription") {
            const userId = session.metadata.userId;

            try {
                // Update subscription status in the database
                await db.query(
                    "UPDATE subscriptions SET status = true WHERE user_id = $1",
                    [userId]
                );

                console.log(`User ${userId} subscription reactivated.`);
            } catch (error) {
                console.error("Error updating subscription:", error.message);
            }
        }
    }

    res.status(200).send("Received webhook");
};

module.exports = {
    handleCheckoutSessionCompleted,
    handleStripeWebhook,
};
