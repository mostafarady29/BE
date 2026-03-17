require('dotenv').config();
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const citizensRoutes = require('./routes/citizens');
const statusesRoutes = require('./routes/statuses');
const postsRoutes = require('./routes/posts');
const newsRoutes = require('./routes/news');
const oldRequestsRoutes = require('./routes/oldRequests');
const attachmentsRoutes = require('./routes/attachments');
const dashboardRoutes = require('./routes/dashboard');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ─── Security Middleware ───────────────────────────────────────────────────────
app.use(helmet());

app.set('trust proxy', 1);

const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5173'];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (curl, Postman) OR from file:// (origin === 'null' string)
        if (!origin || origin === 'null') return callback(null, true);

        // Allow all vercel.app subdomains and any specifically whitelisted origins
        if (origin.endsWith('.vercel.app') || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Forwarded-For'],
    credentials: true,
}));

// ─── General Rate Limit ───────────────────────────────────────────────────────
app.use('/api', rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, message: 'Too many requests, please try again later.' },
}));



// ─── Body Parsing ─────────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
    res.json({ success: true, message: 'MP System API is running', timestamp: new Date().toISOString() });
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/citizens', citizensRoutes);
app.use('/api/statuses', statusesRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/news', newsRoutes); // Dedicated news route
app.use('/api/old-requests', oldRequestsRoutes); // Archive requests
app.use('/api', attachmentsRoutes);  // /api/posts/:id/attachments & /api/attachments/:id
app.use('/api/dashboard', dashboardRoutes);

// ─── 404 Handler ──────────────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀  MP System API running on http://localhost:${PORT}`);
    console.log(`📋  Environment: ${process.env.NODE_ENV || 'development'}\n`);
});

module.exports = app;
