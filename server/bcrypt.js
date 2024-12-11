const bcrypt = require("bcrypt");

const plainPassword = "password123";
bcrypt.hash(plainPassword, 10, (err, hash) => {
    if (err) {
        console.error("Error hashing password:", err);
    } else {
        console.log("Generated hash:", hash);
    }
});
