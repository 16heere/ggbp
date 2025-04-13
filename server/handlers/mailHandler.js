const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.office365.com", // Microsoft 365 SMTP server
    port: 587, // TLS port
    secure: false, // Use TLS, not SSL
    auth: {
        user: "contact@ggbp.org.uk", // Your full GoDaddy email
        pass: process.env.EMAIL_PASSWORD, // Your email password (not app password)
    },
    tls: {
        ciphers: "SSLv3",
    },
});

async function sendEmail(to, subject, text, html) {
    try {
        const mailOptions = {
            from: `"GGBP" <contact@ggbp.org.uk>`,
            to,
            subject,
            text,
            html,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("✅ Email sent:", info.response);
    } catch (error) {
        console.error("❌ Error sending email:", error);
    }
}

module.exports = { sendEmail };
