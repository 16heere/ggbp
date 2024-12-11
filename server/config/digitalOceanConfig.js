const AWS = require("aws-sdk");

const s3 = new AWS.S3({
    endpoint: "https://lon1.digitaloceanspaces.com",
    region: "lon1",
    credentials: {
        accessKeyId: process.env.DIGITALOCEAN_ACCESS_KEY,
        secretAccessKey: process.env.DIGITALOCEAN_SECRET_KEY,
    },
});

module.exports = { s3 };
