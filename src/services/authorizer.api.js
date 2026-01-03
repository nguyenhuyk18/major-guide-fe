import { instanceCallApi } from './api.setting';

const loginAdmin = async (data) => {
    const rs = await instanceCallApi.post('/api/v2/authorizer/login', JSON.stringify(data), {
        headers: {
            "Content-Type": 'application/json'
        }
    })

    return rs;
}

export { loginAdmin }