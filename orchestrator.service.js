const detectionService = require('./detection.service');
const solutionService = require('./solution.service');
const executionService = require('./execution.service');
const eventBus = require('../events/event.bus');

class OrchestratorService {
    
    async fullPipeline(problem, userId) {
        console.log('\n🚀 Orchestrator: Starting Full Pipeline');
        
        // Step 1: Detect
        const detection = await detectionService.detect(problem);
        eventBus.emit('problem:detected', { userId, detection });
        
        // Step 2: Generate Solutions
        const solutions = await solutionService.generate(detection);
        eventBus.emit('solution:generated', { userId, solutions });
        
        // Step 3: Auto-select best solution
        const best = solutions[0];
        
        // Step 4: Execute fix
        const fix = await executionService.execute(best, userId);
        eventBus.emit('fix:applied', { userId, fix });
        
        return {
            detection,
            solutions,
            applied: best,
            fix,
            timestamp: new Date().toISOString()
        };
    }
    
    async quickDiagnose(problem) {
        const detection = await detectionService.detect(problem);
        const solutions = await solutionService.generate(detection);
        return { detection, solutions };
    }
}

module.exports = new OrchestratorService();

