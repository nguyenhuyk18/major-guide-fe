import { instanceCallApi } from './api.setting';

// lấy useraccess theo mảng id
const getUserByIds = async (data) => {
    const rs = await instanceCallApi.post('/api/v2/user/many-user', JSON.stringify(data), {
        headers: {
            "Content-Type": 'application/json'
        }
    });

    return rs;
}

// lấy useraccess theo id
const getUserAccess = async (id) => {
    const rs = await instanceCallApi.get(`/api/v2/user/${id}`);
    return rs;
}

const getListUser = async (page = '', status = '', name = '', limit = '', sort = '', role = '') => {
    const rs = await instanceCallApi.get(`/api/v2/user?page=${page}&status=${status}&limit=${limit}&sort=${sort}&role=${role}&name=${name}`);
    return rs;
}

const getProvinceList = async () => {
    const rs = await instanceCallApi.get('/api/v2/province');

    return rs;
}


const getAllProvince = async () => {
    const rs = await instanceCallApi.get('/api/v2/province');
    return rs;
}


const getWardByIdProvince = async (id_province) => {
    const rs = await instanceCallApi.get(`/api/v2/ward/province/${id_province}`);
    return rs;
}

const updateFileAvartar = async (id, file) => {
    const rs = await instanceCallApi.put(`/api/v2/user/upload-image/${id}`, file);
    return rs;
}


const updateUserAccess = async (id, data) => {
    const rs = await instanceCallApi.put(`/api/v2/user/${id}`, data);
    return rs;
}


export { getUserAccess, getListUser, getProvinceList, getWardByIdProvince, getAllProvince, getUserByIds, updateFileAvartar, updateUserAccess }