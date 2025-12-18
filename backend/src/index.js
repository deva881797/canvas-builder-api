const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const canvasRoutes = require('./routes/canvas');

const app = express();
const port = process.env.PORT || 3000;

// Middleware - explicit CORS config for file downloads
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'Content-Type']
}));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/canvas', canvasRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ status: 'ok', message: 'Canvas Builder API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(port, '0.0.0.0', () => {
    console.log(`🎨 Canvas Builder API running on port ${port}`);
});
