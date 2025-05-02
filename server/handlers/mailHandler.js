const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.mailersend.net",
    port: 587,
    secure: false,
    auth: {
        user: process.env.MAILERSEND_SMTP_USERNAME,
        pass: process.env.MAILERSEND_SMTP_PASSWORD,
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
