import { instanceCallApi } from './api.setting';

const getUserAccess = async (id) => {
    const rs = await instanceCallApi.get(`/api/v2/user/${id}`);
    return rs;
}

const getListUser = async (page = '', limit = '', sort = '', role = '') => {
    const rs = await instanceCallApi.get(`/api/v2/user?page=${page}&limit=${limit}&sort=${sort}&role=${role}`);
    return rs;
}


export { getUserAccess, getListUser }