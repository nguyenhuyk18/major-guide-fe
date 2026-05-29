import { instanceCallApi } from './api.setting';

const getExpertBookings = async (page = 1, limit = 10) => {
    const rs = await instanceCallApi.get(`/api/v2/book/expert-bookings`, {
        params: { page, limit }
    });
    return rs;
};

const expertJoinBooking = async (bookingId) => {
    const rs = await instanceCallApi.put(`/api/v2/book/expert/join-booking`, {
        bookingId
    });
    return rs;
};

export { getExpertBookings, expertJoinBooking };
