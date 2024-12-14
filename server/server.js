const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const bodyParser = require("body-parser");
const courseRoutes = require("./routes/courseRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");
const {
    handleCheckoutSessionCompleted,
} = require("./handlers/webhookHandlers");

const app = express();

app.use(cors());

app.post(
    "/webhook",
    bodyParser.raw({ type: "application/json" }),
    async (req, res) => {
        const endpointSecret = process.env.STRIPE_ENPOINT_SECRET;
        const sig = req.headers["stripe-signature"];

        let event;

        try {
            // Verify the webhook signature
            event = stripe.webhooks.constructEvent(
                req.body,
                sig,
                endpointSecret
            );
        } catch (err) {
            console.error(
                "Webhook signature verification failed:",
                err.message
            );
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        // Handle the event
        switch (event.type) {
            case "checkout.session.completed":
                const session = event.data.object;
                try {
                    await handleCheckoutSessionCompleted(session);
                } catch (err) {
                    console.error("Error handling checkout session:", err);
                    return res.status(500).send("Internal Server Error");
                }
                break;
            default:
                console.log(`Unhandled event type: ${event.type}`);
        }

        // Return a response to acknowledge receipt of the event
        res.status(200).json({ received: true });
    }
);

app.use(express.json());
app.use(express.json({ limit: "500mb" }));
app.use(express.urlencoded({ limit: "500mb", extended: true }));

app.use("/api/courses", courseRoutes);
app.use("/api/subscription", subscriptionRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
