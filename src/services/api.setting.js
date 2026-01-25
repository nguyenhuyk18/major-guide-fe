import axios from 'axios'
import { navigateTo } from '../helpers/help';
import { store } from '../index';
import { LOGOUT_ADMIN } from '../constants/AuthAdminConstant';
import { LOGOUT } from '../constants/AuthConstant';



const instanceCallApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});




// Add a request interceptor
instanceCallApi.interceptors.request.use(function (config) {
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    // Do something before request is sent
    // console.log(process.env.REACT_APP_API_URL)
    let tmp = null;

    // thêm token mỗi lần gửi request !!!
    let authAdminInfo = localStorage.getItem('authAdminInfo') ? JSON.parse(localStorage.getItem('authAdminInfo')) : '';
    let authClientInfo = localStorage.getItem('authInfo') ? JSON.parse(localStorage.getItem('authInfo')) : '';

    if (isAdminRoute && authAdminInfo && authAdminInfo.isLogin) {
        tmp = JSON.parse(localStorage.getItem('authAdminInfo'));
    }
    else if (!isAdminRoute && authClientInfo && authClientInfo.isLogin) {
        tmp = JSON.parse(localStorage.getItem('authInfo'));
    }




    if (tmp) {
        config.headers.authorization = `Bearer ${tmp.access_token}`;
    }


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
        store.dispatch({ type: LOGOUT_ADMIN });
        store.dispatch({ type: LOGOUT });
        // localStorage.removeItem('authAdminInfo');
        navigateTo('/');
    }
    return Promise.reject(error);
});


export { instanceCallApi }