// ============================================
// alerts/notification.service.js
// NOTIFICATION SERVICE
// Email, SMS, Push, Slack, Discord, Teams
// ============================================

class NotificationService {
    
    constructor() {
        this.providers = this.initProviders();
        this.templates = this.initTemplates();
        this.history = [];
    }
    
    // ==========================================
    // INITIALIZE PROVIDERS
    // ==========================================
    initProviders() {
        return {
            EMAIL: {
                name: 'Email',
                send: async (to, subject, body) => {
                    console.log(`📧 Email to: ${to}`);
                    console.log(`   Subject: ${subject}`);
                    // In production: nodemailer.sendMail()
                    return { sent: true, messageId: 'msg_' + Date.now() };
                }
            },
            SMS: {
                name: 'SMS',
                send: async (to, message) => {
                    console.log(`📱 SMS to: ${to}: ${message}`);
                    // In production: twilio.messages.create()
                    return { sent: true, messageId: 'sms_' + Date.now() };
                }
            },
            SLACK: {
                name: 'Slack',
                send: async (channel, message) => {
                    console.log(`💬 Slack #${channel}: ${message}`);
                    // In production: slack.chat.postMessage()
                    return { sent: true, ts: Date.now() };
                }
            },
            DISCORD: {
                name: 'Discord',
                send: async (channel, message) => {
                    console.log(`🎮 Discord #${channel}: ${message}`);
                    return { sent: true, messageId: 'disc_' + Date.now() };
                }
            },
            TEAMS: {
                name: 'Microsoft Teams',
                send: async (channel, message) => {
                    console.log(`💼 Teams #${channel}: ${message}`);
                    return { sent: true, messageId: 'teams_' + Date.now() };
                }
            },
            PUSH: {
                name: 'Push Notification',
                send: async (userId, title, body) => {
                    console.log(`🔔 Push to ${userId}: ${title}`);
                    // In production: firebase.messaging.send()
                    return { sent: true, messageId: 'push_' + Date.now() };
                }
            },
            WEBHOOK: {
                name: 'Webhook',
                send: async (url, data) => {
                    console.log(`🔗 Webhook to: ${url}`);
                    // In production: axios.post(url, data)
                    return { sent: true, statusCode: 200 };
                }
            }
        };
    }
    
    // ==========================================
    // TEMPLATES
    // ==========================================
    initTemplates() {
        return {
            WELCOME: {
                subject: 'Welcome to Supreme Problem Detector! 🚀',
                body: `Hi {{name}},\n\nWelcome aboard! Your first problem fix is completely FREE.\n\nGet started: {{dashboardUrl}}\n\n- Supreme Team`
            },
            PROBLEM_DETECTED: {
                subject: '🔍 Problem Detected: {{problemType}}',
                body: `Problem: {{problemDescription}}\nSeverity: {{severity}}\nConfidence: {{confidence}}%\n\nView details: {{problemUrl}}`
            },
            PROBLEM_FIXED: {
                subject: '✅ Problem Fixed: {{problemType}}',
                body: `Your problem has been resolved!\n\nBefore: {{beforeMetrics}}\nAfter: {{afterMetrics}}\n\nView report: {{reportUrl}}`
            },
            PAYMENT_RECEIPT: {
                subject: '💰 Payment Receipt - Supreme Problem Detector',
                body: `Amount: ${{amount}}\nDate: {{date}}\nProblem: {{problemType}}\n\nInvoice: {{invoiceUrl}}`
            },
            SUBSCRIPTION_UPGRADED: {
                subject: '⬆️ Subscription Upgraded to {{plan}}',
                body: `Your plan has been upgraded to {{plan}}.\n\nNew features:\n{{features}}\n\nManage: {{billingUrl}}`
            },
            SECURITY_ALERT: {
                subject: '🚨 SECURITY ALERT - Immediate Action Required',
                body: `Security incident detected!\n\nType: {{incidentType}}\nTime: {{timestamp}}\nAction: {{actionRequired}}\n\nRespond immediately: {{responseUrl}}`
            },
            WEEKLY_REPORT: {
                subject: '📊 Weekly Report - Supreme Problem Detector',
                body: `Weekly Summary:\n- Problems Detected: {{problemsDetected}}\n- Problems Fixed: {{problemsFixed}}\n- Money Saved: ${{moneySaved}}\n\nFull report: {{reportUrl}}`
            }
        };
    }
    
    // ==========================================
    // SEND NOTIFICATION
    // ==========================================
    async send(provider, to, template, data) {
        const tpl = this.templates[template];
        if (!tpl) throw new Error(`Template not found: ${template}`);
        
        const subject = this.interpolate(tpl.subject, data);
        const body = this.interpolate(tpl.body, data);
        
        const providerInstance = this.providers[provider];
        if (!providerInstance) throw new Error(`Provider not found: ${provider}`);
        
        let result;
        switch (provider) {
            case 'EMAIL':
                result = await providerInstance.send(to, subject, body);
                break;
            case 'SMS':
                result = await providerInstance.send(to, body.substring(0, 160));
                break;
            case 'PUSH':
                result = await providerInstance.send(to, subject, body);
                break;
            default:
                result = await providerInstance.send(to, `${subject}\n${body}`);
        }
        
        // Log
        this.history.push({
            provider,
            to,
            template,
            subject,
            timestamp: new Date().toISOString(),
            result
        });
        
        return result;
    }
    
    // ==========================================
    // SMART NOTIFICATION
    // ==========================================
    async notifyProblem(problem, user) {
        const data = {
            name: user.name || 'User',
            problemType: problem.type,
            problemDescription: problem.description,
            severity: problem.severity,
            confidence: problem.confidence,
            problemUrl: `https://app.supremedetector.com/problems/${problem.id}`,
            beforeMetrics: problem.beforeMetrics || 'N/A',
            afterMetrics: problem.afterMetrics || 'Pending'
        };
        
        // Email always
        await this.send('EMAIL', user.email, 'PROBLEM_DETECTED', data);
        
        // SMS for critical
        if (problem.severity === 'CRITICAL' && user.phone) {
            await this.send('SMS', user.phone, 'PROBLEM_DETECTED', data);
        }
        
        // Push if enabled
        if (user.pushEnabled) {
            await this.send('PUSH', user.id, 'PROBLEM_DETECTED', data);
        }
        
        return { notified: true, channels: ['EMAIL', problem.severity === 'CRITICAL' ? 'SMS' : null, user.pushEnabled ? 'PUSH' : null].filter(Boolean) };
    }
    
    async notifyFixed(problem, user) {
        const data = {
            name: user.name,
            problemType: problem.type,
            beforeMetrics: problem.beforeMetrics || 'N/A',
            afterMetrics: problem.afterMetrics || 'RESOLVED',
            reportUrl: `https://app.supremedetector.com/reports/${problem.id}`
        };
        
        await this.send('EMAIL', user.email, 'PROBLEM_FIXED', data);
        return { notified: true };
    }
    
    async notifyWelcome(user) {
        const data = {
            name: user.name || 'User',
            dashboardUrl: 'https://app.supremedetector.com/dashboard'
        };
        
        await this.send('EMAIL', user.email, 'WELCOME', data);
        return { notified: true };
    }
    
    async notifyPayment(user, payment) {
        const data = {
            name: user.name,
            amount: payment.amount,
            date: new Date().toLocaleDateString(),
            problemType: payment.problemType,
            invoiceUrl: payment.invoiceUrl
        };
        
        await this.send('EMAIL', user.email, 'PAYMENT_RECEIPT', data);
        return { notified: true };
    }
    
    // ==========================================
    // HELPER
    // ==========================================
    interpolate(template, data) {
        let result = template;
        for (const [key, value] of Object.entries(data)) {
            result = result.replace(new RegExp(`{{${key}}}`, 'g'), value || '');
        }
        return result;
    }
    
    getHistory(limit = 100) {
        return this.history.slice(-limit);
    }
}

// ============================================
// EXPORT
// ============================================
module.exports = new NotificationService();

