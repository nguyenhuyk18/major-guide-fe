import { instanceCallApi } from './api.setting';

const getExpertById = async (id) => {
    const rs = await instanceCallApi.get(`/api/v2/expert/${id}`);
    return rs;
};

const getUserById = async (id) => {
    const rs = await instanceCallApi.get(`/api/v2/user/${id}`);
    return rs;
};

const getMemberById = async (id) => {
    const rs = await instanceCallApi.get(`/api/v2/member/${id}`);
    return rs;
};

const getExpertInfo = async (id_expert, id_member) => {
    const promises = [];
    
    if (id_expert) {
        promises.push(getUserById(id_expert).catch(() => null));
    }
    if (id_member) {
        promises.push(getMemberById(id_member).catch(() => null));
    }
    
    const results = await Promise.all(promises);
    
    return {
        expert: results[0]?.data?.data || null,
        member: results[1]?.data?.data || null
    };
};

export { getExpertById, getUserById, getMemberById, getExpertInfo };
