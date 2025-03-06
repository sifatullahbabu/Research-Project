const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const path = require('path');
const app = express();
const PORT = 3000;
const savetoDB = require('./controller/portal.controller.js');

// Expanded list of security headers to check
const securityHeaders = [
    "Content-Security-Policy",
    "Strict-Transport-Security",
    "X-XSS-Protection",
    "X-Frame-Options",
    "X-Content-Type-Options",
    "Referrer-Policy",
    "Cross-Origin-Opener-Policy",
    "Permissions-Policy",
    "Set-Cookie Attributes",
    "Cache-Control"
];

// Connect to MongoDB
try {
    mongoose.connect('mongodb://localhost:27017/Project', {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }).then(() => {
        console.log("Database connected");
    });
} catch (error) {
    console.error("Database connection failed", error);
}

// Middleware to parse JSON request body
app.use(express.json());
app.use(express.static(path.join(__dirname, "/public")));

// Serve the frontend
app.get("/api", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

// Endpoint to check security headers
app.post('/api/headers', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'Please provide a valid URL.' });
    }

    try {
        // Perform a HEAD request to fetch headers
        const response = await axios.head(url, { validateStatus: () => true });

        // Prepare the headers report
        const headersReport = {};
        securityHeaders.forEach(header => {
            headersReport[header] = response.headers[header.toLowerCase()] || "missing";
        });

        // Save the result to the database
        const ok = savetoDB({ portalName: url, headerStatus: headersReport });

        // Return the report
        return res.json({ url, headers: headersReport });
    } catch (error) {
        console.error('Error fetching headers:', error.message);
        return res.status(500).json({ error: 'Failed to fetch headers' });
    }
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
