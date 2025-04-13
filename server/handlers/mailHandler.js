const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendEmail(to, subject, text, html) {
    try {
        const data = await resend.emails.send({
            from: "GGBP <contact@ggbp.org.uk>",
            to,
            subject,
            text,
            html,
        });

        console.log("✅ Email sent:", data);
    } catch (error) {
        console.error("❌ Error sending email:", error.message);
    }
}

module.exports = {
    sendEmail,
};
