import { instanceCallApi } from './api.setting';

const getAllPosts = async () => {
    const rs = await instanceCallApi.get('/api/v2/post');
    return rs;
};

const getPostsByExpert = async (expertId) => {
    const rs = await instanceCallApi.get(`/api/v2/post/expert/${expertId}`);
    return rs;
};

const getPostById = async (id) => {
    const rs = await instanceCallApi.get(`/api/v2/post/${id}`);
    return rs;
};

const createPost = async (formData) => {
    const rs = await instanceCallApi.post('/api/v2/post', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return rs;
};

const updatePost = async (id, formData) => {
    const rs = await instanceCallApi.put(`/api/v2/post/${id}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
    return rs;
};

const deletePost = async (id) => {
    const rs = await instanceCallApi.delete(`/api/v2/post/${id}`);
    return rs;
};

export {
    getAllPosts,
    getPostsByExpert,
    getPostById,
    createPost,
    updatePost,
    deletePost
};
