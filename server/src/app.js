require('dotenv').config({ path: '.env.local' });
const express = require("express");
const app = express();
const path = require('path');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const session = require('express-session');

// --- DATABASE & SDK INIT ---
// @ts-ignore
const { sessionManager } = require('./config/joonweb');

// @ts-ignore
const coreRoutes = require('./routes/core_routes');
// @ts-ignore
const checkValidation = require('./middleware/checkValidation');
// @ts-ignore
const authRoutes = require("./routes/auth_routes");

// --- MIDDLEWARE IMPORTS ---
// @ts-ignore
const errorHandler = require('./middleware/errorHandler');

// --- 1. CONFIGURATION ---
app.set('trust proxy', 1);

app.use(cors({ origin: '*', methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"], allowedHeaders: "*" }));
app.use(express.json({ limit: "20kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());

app.use(session({
  secret: process.env.JOONWEB_CLIENT_SECRET || 'joonweb-app-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: true, sameSite: "none", httpOnly: true, maxAge: 24 * 60 * 60 * 1000 }
}));

// Global Middleware to attach sessionManager for backward compatibility
app.use((req, res, next) => {
  req.sessionManager = sessionManager;
  next();
});

// --- 2. STATIC EXTENSION SCRIPT ---
app.get('extensions/reels-section/assets/reels-section.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.sendFile(path.join(__dirname, '../extensions/reels-section/assets/reels-section.js'), (err) => {
    if (err) res.status(404).send("File not found");
  });
});

// --- 3. ROUTES ---
app.use('/', coreRoutes);
app.use('/auth', authRoutes);

app.get("/healthCheck", (req, res) => res.send("Backend is running 🚀"));

// --- 4. STATIC UI & FALLBACK ---
app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res) => res.sendFile(path.join(__dirname, './dist', 'index.html')));

// --- 5. ERROR HANDLING ---
app.use(errorHandler);

module.exports = app;