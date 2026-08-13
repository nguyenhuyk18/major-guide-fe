import { instanceCallApi } from './api.setting';

const createLinkPayment = async (orderId) => {
    const rs = await instanceCallApi.post(`/api/v2/payment/checkout-session`, { orderId });
    return rs;
};

const getCheckoutStatus = async (sessionId) => {
    const rs = await instanceCallApi.get(`/api/v2/payment/checkout-session/${encodeURIComponent(sessionId)}/status`);
    return rs;
};

export { createLinkPayment, getCheckoutStatus };
