const bcrypt = require("bcrypt");
const db = require("../models/db");

async function handleCheckoutSessionCompleted(session) {
    const email = session.metadata.email;
    const password = session.metadata.password
        ? session.metadata.password
        : null;
    const hashedPassword =
        password != null ? await bcrypt.hash(password, 10) : null;
    const stripeSubscriptionId = session.subscription;

    try {
        // Check if the user already exists
        const existingUser = await db.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );

        let userId;

        if (existingUser.rows.length > 0) {
            // Existing user
            userId = existingUser.rows[0].id;

            // Check if the user has an existing subscription
            const existingSubscription = await db.query(
                "SELECT id FROM subscriptions WHERE user_id = $1",
                [userId]
            );

            if (existingSubscription.rows.length > 0) {
                // Update existing subscription
                await db.query(
                    "UPDATE subscriptions SET stripe_subscription_id = $1, status = $2 WHERE user_id = $3",
                    [stripeSubscriptionId, true, userId]
                );
                console.log(`Subscription updated for user ${email}`);
            } else {
                // Insert a new subscription for the existing user
                await db.query(
                    "INSERT INTO subscriptions (user_id, stripe_subscription_id, status) VALUES ($1, $2, $3)",
                    [userId, stripeSubscriptionId, true]
                );
                console.log(`Subscription added for existing user ${email}`);
            }
        } else {
            // New user
            const insertUserQuery =
                "INSERT INTO users (email, password, is_admin) VALUES ($1, $2, $3) RETURNING id";
            const userResult = await db.query(insertUserQuery, [
                email,
                hashedPassword,
                false, // Assuming new users are not admins
            ]);
            userId = userResult.rows[0].id;

            // Insert a new subscription for the new user
            await db.query(
                "INSERT INTO subscriptions (user_id, stripe_subscription_id, status) VALUES ($1, $2, $3)",
                [userId, stripeSubscriptionId, true]
            );
            console.log(`New user ${email} subscribed`);
        }
    } catch (err) {
        console.error("Error handling course subscription:", err.message);
        throw new Error("Database operation failed");
    }
}

module.exports = {
    handleCheckoutSessionCompleted,
};
