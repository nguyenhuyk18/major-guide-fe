import { instanceCallApi } from './api.setting';

const getUserAccess = async (id) => {
    const rs = await instanceCallApi.get(`/api/v2/user/${id}`);
    return rs;
}


export { getUserAccess }