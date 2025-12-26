import axios from 'axios'


const instanceCallApi = axios.create({
    baseURL: process.env.REACT_APP_API_URL
});




// Add a request interceptor
instanceCallApi.interceptors.request.use(function (config) {
    // Do something before request is sent
    // console.log(process.env.REACT_APP_API_URL)
    return config;
}, function (error) {
    // Do something with request error
    return Promise.reject(error);
});

// Add a response interceptor
instanceCallApi.interceptors.response.use(function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response;
}, function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    // console.log(error)
    return Promise.reject(error);
});


export { instanceCallApi }