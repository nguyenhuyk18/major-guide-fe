import { instanceCallApi } from './api.setting';

const getUserByIds = async (data) => {
    const rs = await instanceCallApi.post('/api/v2/user/many-user', JSON.stringify(data), {
        headers: {
            "Content-Type": 'application/json'
        }
    });

    return rs;
}

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


export { getUserAccess, getListUser, getProvinceList, getWardByIdProvince, getAllProvince, getUserByIds }