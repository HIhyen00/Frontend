import axios from "axios";

export const api = axios.create({
    baseURL: "http://localhost:8004/api/qna",
    headers: { "Content-Type": "application/json" },
    withCredentials: true, // 인증 필요 시
});

// Question API
export const getQuestions = (params: any) =>
    api.get("/questions", { params }).then(res => res.data);

export const getQuestion = (id: number) =>
    api.get(`/questions/${id}`).then(res => res.data);

export const createQuestion = (data: { title: string; content: string; category?: string }) =>
    api.post("/questions", data).then(res => res.data);

export const updateQuestion = (id: number, data: any) =>
    api.put(`/questions/${id}`, data);

export const deleteQuestion = (id: number) =>
    api.delete(`/questions/${id}`);

// Answer API
export const getAnswers = (questionId: number, page = 0, size = 10) =>
    api.get("/answers", { params: { questionId, page, size } }).then(res => res.data);

export const createAnswer = (data: { questionId: number; content: string; isPrivate?: boolean }) =>
    api.post("/answers", data).then(res => res.data);

export const updateAnswer = (id: number, data: any) =>
    api.put(`/answers/${id}`, data);

export const deleteAnswer = (id: number) =>
    api.delete(`/answers/${id}`);

export const voteAnswer = (id: number, type: "UP" | "DOWN") =>
    api.post(`/answers/${id}/votes`, { type });

export const reportAnswer = (id: number, reason: string) =>
    api.post(`/answers/${id}/reports`, { reason });
