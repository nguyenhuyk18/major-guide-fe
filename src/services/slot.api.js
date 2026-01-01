// import axios from 'axios';
import { instanceCallApi } from './api.setting';

const getShiftInDay = async (endTime = null, startTime = null) => {
    let str = `/api/v2/shift-in-day`;

    if (endTime && startTime) {
        str = `/api/v2/shift-in-day?start_time=${startTime}&end_time=${endTime}`;
    }

    const rs = await instanceCallApi.get(str);

    return rs;
}

const getAllShift = async () => {
    const rs = await instanceCallApi.get('/api/v2/shift');
    return rs;
}

const getShiftById = async (id, specifytime) => {
    const tmp = specifytime.split('_');
    // const newSpecifyTime = new Date(`${tmp[0]}-${tmp[1]}-${tmp[2]}`)
    const rs = await instanceCallApi.get(`/api/v2/shift-in-day/${id}?specify_time=${tmp[0]}-${tmp[1]}-${tmp[2]}`);
    return rs;
}


const getAllRegister = async (page = '', status = '') => {
    const rs = await instanceCallApi.get(`/api/v2/register?page=${page}&status=${status}`);
    return rs;
}


const getAllRegisterById = async (id) => {
    const rs = await instanceCallApi.get(`/api/v2/register/${id}`);
    return rs;
}


const cancleRegisterById = async (id) => {
    const rs = await instanceCallApi.put(`/api/v2/register/cancle-register/${id}`);
    return rs;
}

const approveRegisterById = async (id) => {
    const rs = await instanceCallApi.put(`/api/v2/register/accept-register/${id}`);
    return rs;
}

export { getShiftInDay, getAllShift, getShiftById, getAllRegister, getAllRegisterById, cancleRegisterById, approveRegisterById }