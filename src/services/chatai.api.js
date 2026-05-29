import { instanceCallApi } from './api.setting';

const sendChatAiMessage = async (message) => {
    const rs = await instanceCallApi.post('/api/v2/chat-ai', JSON.stringify({ message }), {
        headers: { 'Content-Type': 'application/json' }
    });
    return rs;
};

const sendAiChatClient = async (message) => {
    const rs = await instanceCallApi.post('/api/v2/chat-ai/rag', JSON.stringify({ message }), {
        headers: { 'Content-Type': 'application/json' }
    });
    return rs;
}

export { sendChatAiMessage, sendAiChatClient };
