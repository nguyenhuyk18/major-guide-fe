import { instanceCallApi } from './api.setting';

// ==================== Question APIs ====================
export const getQuestions = async (page = 1, limit = 40) => {
    try {
        const res = await instanceCallApi.get('/api/v2/question', {
            params: { page, limit }
        });
        return res?.data?.data?.questions || [];
    } catch (error) {
        console.error('getQuestions error:', error?.response?.data || error.message);
        throw error;
    }
};

// ==================== Test Result APIs ====================
export const saveAnswer = async (userId, questionId, score) => {
    try {
        const res = await instanceCallApi.post('/api/v2/test-result/answer', {
            userId,
            questionId,
            score
        });
        return res?.data?.data;
    } catch (error) {
        console.error('saveAnswer error:', error?.response?.data || error.message);
        throw error;
    }
};

export const submitTest = async (userId, answers, traitScores, totalScore) => {
    try {
        const res = await instanceCallApi.post('/api/v2/test-result/submit', {
            userId,
            answers,
            traitScores,
            totalScore
        });
        return res?.data?.data;
    } catch (error) {
        console.error('submitTest error:', error?.response?.data || error.message);
        throw error;
    }
};

export const getTestResultsByUser = async (userId) => {
    try {
        const res = await instanceCallApi.get(`/api/v2/test-result/user/${userId}`);
        return res?.data?.data || [];
    } catch (error) {
        console.error('getTestResultsByUser error:', error?.response?.data || error.message);
        throw error;
    }
};

export const getLatestTestResult = async (userId) => {
    try {
        const res = await instanceCallApi.get(`/api/v2/test-result/user/${userId}/latest`);
        return res?.data?.data;
    } catch (error) {
        console.error('getLatestTestResult error:', error?.response?.data || error.message);
        throw error;
    }
};

export const getInProgressTest = async (userId) => {
    try {
        const res = await instanceCallApi.get(`/api/v2/test-result/user/${userId}/inprogress`);
        return res?.data?.data;
    } catch (error) {
        console.error('getInProgressTest error:', error?.response?.data || error.message);
        // Return null instead of throwing - this is expected when no in-progress test exists
        if (error?.response?.status === 404) {
            return null;
        }
        throw error;
    }
};

export const getTestResultById = async (id) => {
    try {
        const res = await instanceCallApi.get(`/api/v2/test-result/${id}`);
        return res?.data?.data;
    } catch (error) {
        console.error('getTestResultById error:', error?.response?.data || error.message);
        throw error;
    }
};
