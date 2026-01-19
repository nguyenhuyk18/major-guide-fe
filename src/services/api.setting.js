import axios from 'axios'
import { navigateTo } from '../helpers/help';
import { store } from '../index';
import { LOGOUT_ADMIN } from '../constants/AuthAdminConstant';



const instanceCallApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});




// Add a request interceptor
instanceCallApi.interceptors.request.use(function (config) {
    // Do something before request is sent
    // console.log(process.env.REACT_APP_API_URL)

    // thêm token mỗi lần gửi request !!!
    let tmp = localStorage.getItem('authAdminInfo') || '';

    if (tmp) {
        tmp = JSON.parse(localStorage.getItem('authAdminInfo'));
    }

    config.headers.authorization = `Bearer ${tmp.access_token}`;


    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instanceCallApi.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data

    // console.log()
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // console.log(error.status)

    if (error.status === 401) {
        store.dispatch({ type: LOGOUT_ADMIN })
        // localStorage.removeItem('authAdminInfo');
        navigateTo('/');
    }
    return Promise.reject(error);
});


export { instanceCallApi }