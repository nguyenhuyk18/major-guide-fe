import axios from 'axios';

const AGENTIC_AI_URL = process.env.REACT_APP_AGENTIC_AI_URL || 'http://localhost:8000';

const agenticApi = axios.create({
    baseURL: AGENTIC_AI_URL
});

export const getQuestions = async () => {
    try {
        const res = await agenticApi.get('/career-prediction/questions');
        return res?.data?.questions || [];
    } catch (error) {
        console.error('getCareerQuestions error:', error?.response?.data || error.message);
        throw error;
    }
};

export const getMajors = async () => {
    try {
        const res = await agenticApi.get('/career-prediction/majors');
        return res?.data || { majors: [], total: 0 };
    } catch (error) {
        console.error('getMajors error:', error?.response?.data || error.message);
        throw error;
    }
};

export const predictCareer = async (answers) => {
    try {
        const res = await agenticApi.post('/career-prediction/predict', { answers });
        return res?.data;
    } catch (error) {
        console.error('predictCareer error:', error?.response?.data || error.message);
        throw error;
    }
};

export { agenticApi };
