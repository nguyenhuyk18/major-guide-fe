import { instanceCallApi } from './api.setting';

const loginAdmin = async (data) => {
    const rs = await instanceCallApi.post('/api/v2/authorizer/login', JSON.stringify(data), {
        headers: {
            "Content-Type": 'application/json'
        }
    })

    return rs;
}

const loginClient = async (data) => {
    const rs = await instanceCallApi.post('/api/v2/authorizer/login-client', JSON.stringify(data), {
        headers: {
            "Content-Type": 'application/json'
        }
    })

    return rs;
}


const createExpert = async (data) => {
    const rs = await instanceCallApi.post('/api/v2/authorizer/expert', JSON.stringify(data), {
        headers: {
            "Content-Type": 'application/json'
        }
    });

    return rs;
}

export { loginAdmin, createExpert, loginClient }