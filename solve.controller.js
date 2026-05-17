const orchestrator = require('../services/orchestrator.service');

exports.solve = async (req, res) => {
    try {
        const { problem } = req.body;
        if (!problem) return res.status(400).json({ error: 'Problem required' });
        
        const result = await orchestrator.fullPipeline(problem, req.user?.id);
        res.json({ success: true, ...result });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getStatus = async (req, res) => {
    res.json({ id: req.params.id, status: 'COMPLETED' });
};

