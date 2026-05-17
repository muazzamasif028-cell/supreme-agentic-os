const express = require('express');
const router = express.Router();
const solveController = require('../controllers/solve.controller');
const auth = require('../middleware/auth.middleware');

// POST /api/solve - Full problem solution
router.post('/', auth.jwtAuth, solveController.solve);

// GET /api/solve/:id - Get solution status
router.get('/:id', auth.jwtAuth, solveController.getStatus);

module.exports = router;

