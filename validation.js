// ============================================
// middleware/validation.js
// Request Validation Middleware
// ============================================

const { body, param, query, validationResult } = require('express-validator');

// Validation error formatter
const validate = (validations) => {
    return async (req, res, next) => {
        for (const validation of validations) {
            const result = await validation.run(req);
            if (result.errors.length) break;
        }

        const errors = validationResult(req);
        
        if (errors.isEmpty()) {
            return next();
        }

        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            code: 'VALIDATION_ERROR',
            errors: errors.array().map(e => ({
                field: e.path,
                message: e.msg,
                value: e.value
            }))
        });
    };
};

// Common validation rules
const rules = {
    // Auth
    signup: [
        body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('name').optional().trim().isLength({ min: 2 }),
        body('company').optional().trim()
    ],
    
    login: [
        body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
        body('password').notEmpty().withMessage('Password required')
    ],

    // Detection
    detect: [
        body('problem').isString().isLength({ min: 10, max: 5000 })
            .withMessage('Problem description must be 10-5000 characters'),
        body('language').optional().isString(),
        body('context').optional().isObject()
    ],

    // Payment
    payment: [
        body('amount').isFloat({ min: 0.5 }).withMessage('Amount must be at least $0.50'),
        body('currency').optional().isIn(['USD', 'EUR', 'GBP']),
        body('paymentMethodId').optional().isString()
    ],
    
    subscribe: [
        body('plan').isIn(['STARTER', 'PRO', 'BUSINESS', 'ENTERPRISE'])
            .withMessage('Invalid plan'),
        body('paymentMethodId').isString().notEmpty()
    ],

    // Company
    company: [
        body('name').isString().isLength({ min: 2, max: 100 }).trim(),
        body('domain').optional().isString(),
        body('email').isEmail().normalizeEmail()
    ],
    
    // API Key
    apiKey: [
        body('name').isString().isLength({ min: 2, max: 50 }).trim(),
        body('permissions').isArray({ min: 1 })
    ],

    // ID param
    idParam: [
        param('id').isMongoId().withMessage('Invalid ID format')
    ],
    
    // Pagination
    pagination: [
        query('page').optional().isInt({ min: 1 }).toInt(),
        query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
    ],

    // Email
    email: [
        body('email').isEmail().normalizeEmail(),
        body('subject').optional().isString().isLength({ max: 200 }),
        body('message').optional().isString().isLength({ min: 10 })
    ]
};

// Quick validation (single field)
const requireField = (field, message) => {
    return (req, res, next) => {
        if (!req.body[field]) {
            return res.status(400).json({
                error: message || `${field} is required`
            });
        }
        next();
    };
};

// Sanitize middleware
const sanitize = (req, res, next) => {
    // Trim all string fields
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].trim();
            }
        });
    }
    next();
};

// XSS prevention (basic)
const preventXSS = (req, res, next) => {
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .replace(/on\w+="[^"]*"/gi, '')
                    .replace(/on\w+='[^']*'/gi, '');
            }
        });
    }
    next();
};

module.exports = {
    validate,
    rules,
    requireField,
    sanitize,
    preventXSS
};
