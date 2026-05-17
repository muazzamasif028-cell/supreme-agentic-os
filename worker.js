const jobQueue = require('./job.queue');
const processor = require('./processor');

class Worker {
    constructor() {
        this.active = false;
        this.processedCount = 0;
    }
    
    start() {
        this.active = true;
        console.log('👷 Worker started');
        
        jobQueue.on('job:added', async (job) => {
            if (this.active) {
                await processor.process(job);
                this.processedCount++;
            }
        });
    }
    
    stop() {
        this.active = false;
        console.log(`👷 Worker stopped. Processed: ${this.processedCount}`);
    }
}

module.exports = new Worker();

