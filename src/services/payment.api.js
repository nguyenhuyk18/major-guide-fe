import { instanceCallApi } from './api.setting';

const createLinkPayment = async (orderId, amount, description) => {
    const rs = await instanceCallApi.post(`/api/v2/payment/create-link`, {
        orderId,
        amount,
        description
    });
    return rs;
};

const confirmPayment = async (isValid, orderId, responseCode) => {
    const rs = await instanceCallApi.post(`/api/v2/payment/confirm`, {
        isValid,
        orderId,
        responseCode
    });
    return rs;
};

export { createLinkPayment, confirmPayment };