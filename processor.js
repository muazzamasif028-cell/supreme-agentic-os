class Processor {
    async process(job) {
        console.log(`⚙️ Processing: ${job.id} - ${job.type}`);
        
        const handlers = {
            DETECTION: async (j) => ({ detected: true, type: j.data?.type }),
            EXECUTION: async (j) => ({ executed: true, command: j.data?.command }),
            ALERT: async (j) => ({ alerted: true, channel: j.data?.channel })
        };
        
        const handler = handlers[job.type] || (async () => ({ processed: true }));
        return await handler(job);
    }
}

module.exports = new Processor();

