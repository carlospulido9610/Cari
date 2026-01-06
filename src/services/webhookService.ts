
export interface WebhookPayload {
    type: 'contact' | 'quote';
    data: any;
    timestamp: string;
}

const WEBHOOK_URL = import.meta.env.VITE_WEBHOOK_URL || '';

export const sendToWebhook = async (type: 'contact' | 'quote', data: any): Promise<boolean> => {
    if (!WEBHOOK_URL) {
        console.warn('Webhook URL not configured. Data not sent to automation.', { type, data });
        return false;
    }

    const payload: WebhookPayload = {
        type,
        data,
        timestamp: new Date().toISOString(),
    };

    try {
        const response = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            console.error('Webhook failed:', response.statusText);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Error sending to webhook:', error);
        return false;
    }
};
