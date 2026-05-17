// ============================================
// middleware/rateLimiter.js
// Tier-Based Rate Limiting
// ============================================

const rateLimit = require('express-rate-limit');
const config = require('../config');

// Tier-based limits
const tierLimits = {
    FREE: 10,
    STARTER: 50,
    PRO: 500,
    BUSINESS: 5000,
    ENTERPRISE: 50000,
    GLOBAL: 999999
};

// General API limiter
const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests', retryAfter: '15 minutes' }
});

// Auth limiter (strict)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    skipSuccessfulRequests: true,
    message: { error: 'Too many login attempts', retryAfter: '15 minutes' }
});

// Detection limiter
const detectLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 30,
    message: { error: 'Detection rate limit reached' }
});

// Dynamic tier-based limiter
const tierLimiter = (req, res, next) => {
    const tier = req.user?.tier || 'FREE';
    const max = tierLimits[tier] || 10;

    const limiter = rateLimit({
        windowMs: 1 * 60 * 1000,
        max,
        keyGenerator: (req) => req.user?.id || req.ip,
        handler: (req, res) => {
            res.status(429).json({
                error: 'Rate limit exceeded',
                tier,
                limit: max,
                upgradeUrl: '/pricing',
                retryAfter: '1 minute'
            });
        }
    });

    limiter(req, res, next);
};

// API key limiter
const apiKeyLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    keyGenerator: (req) => req.headers['x-api-key'] || req.ip,
    message: { error: 'API rate limit exceeded' }
});

module.exports = {
    generalLimiter,
    authLimiter,
    detectLimiter,
    tierLimiter,
    apiKeyLimiter
};

