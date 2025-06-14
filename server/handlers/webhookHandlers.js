const bcrypt = require("bcrypt");
const db = require("../models/db");
const axios = require("axios");
const { sendEmail } = require("../handlers/mailHandler");

async function generateTelegramInviteLink() {
    try {
        const response = await axios.post(
            `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/createChatInviteLink`,
            {
                chat_id: process.env.TELEGRAM_GROUP_ID,
                expire_date: 0,
                member_limit: 1,
            }
        );

        return response.data.result.invite_link;
    } catch (error) {
        console.error("Error generating Telegram invite link:", error);
        return null;
    }
}
async function handleCheckoutSessionCompleted(session) {
    const email = session.metadata.email;
    const password = session.metadata.password || null;
    const telegramId = session.metadata.telegram_id;
    const telegramUsername = session.metadata.telegram_username;
    const telegramName = session.metadata.telegram_name;

    const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

    const type = session.metadata?.type || "subscription";
    const stripeSubscriptionId =
        session.subscription ||
        `manual_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

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
                    "UPDATE subscriptions SET stripe_subscription_id = $1, status = $2, type = $3 WHERE user_id = $4",
                    [stripeSubscriptionId, true, type, userId]
                );
                console.log(`Subscription updated for user ${email}`);
            } else {
                // Insert a new subscription for the existing user
                await db.query(
                    "INSERT INTO subscriptions (user_id, stripe_subscription_id, status, type) VALUES ($1, $2, $3, $4)",
                    [userId, stripeSubscriptionId, true, type]
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
                "INSERT INTO subscriptions (user_id, stripe_subscription_id, status, type) VALUES ($1, $2, $3, $4)",
                [userId, stripeSubscriptionId, true, type]
            );
            console.log(`New user ${email} subscribed`);
        }

        await db.query(
            "UPDATE users SET telegram_id = $1, telegram_username = $2, telegram_name = $3 WHERE email = $4",
            [telegramId, telegramUsername, telegramName, email]
        );

        console.log(`Telegram user ${telegramUsername} linked to ${email}`);

        const inviteLink = await generateTelegramInviteLink();
        const text = `Welcome to GGBP, you now have access to the full course on the website. Additionally you can join our premium telegram channel - ${inviteLink}`;
        await sendEmail(
            email,
            "GGBP Telegram link",
            text,
            `<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                <h2 style="color: #007bff;">Welcome to GGBP!</h2>
                <p>Thank you for subscribing!</p>
                <blockquote style="background: #f8f9fa; padding: 10px; border-left: 5px solid #007bff;">
                    <br>
                    <strong>Click below to join our premium telegram:</strong> <br>
                    <a href="${inviteLink}">${inviteLink}</a>
                </blockquote>
                <hr>
                <footer style="font-size: 12px; color: #777;">
                    <p>Best regards,<br> GGBP Team</p>
                </footer>
            </div>`
        );
    } catch (err) {
        console.error("Error handling course subscription:", err.message);
        throw new Error("Database operation failed");
    }
}

module.exports = {
    handleCheckoutSessionCompleted,
    generateTelegramInviteLink,
};
