import { instanceCallApi } from './api.setting';

const sendMessage = async (data) => {
    const rs = await instanceCallApi.post('/api/v2/chat-community', JSON.stringify(data), {
        headers: {
            "Content-Type": 'application/json'
        }
    });
    return rs;
}

const getMessage = async (page) => {
    const rs = await instanceCallApi.get(`/api/v2/chat-community?page=${page}`);

    return rs;
}

export { sendMessage, getMessage }