const orchestrator = require('../services/orchestrator.service');

async function testOrchestrator() {
    console.log('🧪 Testing Orchestrator...\n');
    
    const result = await orchestrator.quickDiagnose('Server CPU high memory leak');
    
    console.log('Detection:', result.detection.type);
    console.log('Solutions:', result.solutions.length);
    console.log('✅ Test passed:', result.detection.type !== 'UNKNOWN');
}

testOrchestrator();

