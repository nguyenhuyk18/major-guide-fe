import { instanceCallApi } from './api.setting';

const getExpertReviews = (expertId, page = 1, limit = 5) =>
    instanceCallApi.get(`/api/v2/reviews/experts/${expertId}`, {
        params: { page, limit }
    });

const createExpertReview = (expertId, data) =>
    instanceCallApi.post(`/api/v2/reviews/experts/${expertId}`, data);

const updateExpertReview = (reviewId, data) =>
    instanceCallApi.put(`/api/v2/reviews/${reviewId}`, data);

const deleteExpertReview = (reviewId) =>
    instanceCallApi.delete(`/api/v2/reviews/${reviewId}`);

export {
    getExpertReviews,
    createExpertReview,
    updateExpertReview,
    deleteExpertReview
};
