import { instanceCallApi } from "./api.setting";
const data = (response) => response?.data?.data;
export const startCareerAssessment = async (context = {}) =>
  data(await instanceCallApi.post("/api/v2/career-assessments", { context }));
export const getNextCareerQuestion = async (id) =>
  data(await instanceCallApi.get(`/api/v2/career-assessments/${id}/next`));
export const answerCareerQuestion = async (id, answer) =>
  data(
    await instanceCallApi.post(
      `/api/v2/career-assessments/${id}/answers`,
      answer
    )
  );
export const saveCareerAcademic = async (id, academic) =>
  data(
    await instanceCallApi.post(
      `/api/v2/career-assessments/${id}/academic`,
      academic
    )
  );
export const completeCareerAssessment = async (id, useAiReview = false) =>
  data(
    await instanceCallApi.post(`/api/v2/career-assessments/${id}/complete`, {
      useAiReview,
    })
  );
export const getCareerAssessmentHistory = async () =>
  data(await instanceCallApi.get("/api/v2/career-assessments/me/history"));
export const sendCareerAssessmentFeedback = async (id, feedback) =>
  data(
    await instanceCallApi.post(
      `/api/v2/career-assessments/${id}/feedback`,
      feedback
    )
  );
export const getCareerExperts = async (families, limit = 4) =>
  data(
    await instanceCallApi.get("/api/v2/career-assessments/experts", {
      params: { families: families.join(","), limit },
    })
  );
