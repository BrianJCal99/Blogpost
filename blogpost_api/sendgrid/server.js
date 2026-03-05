require("dotenv").config();

const express = require("express");
const cors = require("cors");
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["POST"]
}));

app.use(express.json());

// Health check route
app.get("/", (req, res) => {
    res.json({ message: "Server is running" });
});

// Email validation helper
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// Handle POST request
app.post("/", async (req, res) => {
    const { email } = req.body;

    // Validation
    if (!email) {
        return res.status(400).json({
            success: false,
            message: "Email is required"
        });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({
            success: false,
            message: "Invalid email format"
        });
    }

    try {
        console.log("Received email:", email);

        await sgMail.send({
            to: email,
            from: process.env.SENDGRID_FROM, // Must be verified in SendGrid
            subject: "Welcome to our Newsletter 🎉",
            text: "Thanks for subscribing to our newsletter. We hope you enjoy our content!"
        });

        console.log("Email sent successfully");

        return res.status(200).json({
            success: true,
            message: "Confirmation email sent successfully"
        });

    } catch (error) {
        console.error("SendGrid error:", error.response?.body || error.message);

        return res.status(500).json({
            success: false,
            message: "Failed to send email"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});