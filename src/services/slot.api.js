import { instanceCallApi } from './api.setting';

const getShiftInDay = async () => {
    const rs = await instanceCallApi.get('/api/v2/shift-in-day');
    return rs;
}

const getAllShift = async () => {
    const rs = await instanceCallApi.get('/api/v2/shift');
    return rs;
}

const getShiftById = async (id) => {
    const rs = await instanceCallApi.get(`/api/v2/shift-in-day/${id}`);
    return rs;
}

export { getShiftInDay, getAllShift, getShiftById }