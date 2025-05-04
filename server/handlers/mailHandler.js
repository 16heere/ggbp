const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    port: 587,
    secure: false,
    auth: {
        user: "8c00cb001@smtp-brevo.com",
        pass: process.env.BREVO_SMTP_KEY,
    },
});

async function sendEmail(to, subject, text, html) {
    try {
        const info = await transporter.sendMail({
            from: `"GGBP" <contact@ggbp.org.uk>`,
            to,
            subject,
            text,
            html,
        });
        console.log("✅ Email sent:", info.messageId);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}

module.exports = {
    sendEmail,
};
