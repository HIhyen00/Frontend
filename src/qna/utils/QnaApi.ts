import axios from 'axios';
import type { Question, Answer, VoteRequest, ReportRequest } from '../types/qna';

const API_BASE_URL = import.meta.env.VITE_QNA_API_URL || "http://localhost:8004/api/qna";

const QnaApi = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
});

// 요청 시 자동으로 토큰 추가
QnaApi.interceptors.request.use((config) => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token && token !== "undefined" && token !== "null") {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

QnaApi.interceptors.response.use(
    (res) => res,
    (err) => {
        if (err.response?.status === 401) console.error('로그인 필요');
        return Promise.reject(err);
    }
);

// ---------------- Questions ----------------
export const getQuestions = (category?: string, sort?: string, page = 0, size = 10) =>
    QnaApi.get<{ content: Question[]; totalPages: number }>('/questions', { params: { category, sort, page, size } });

export const getQuestion = (id: number) => QnaApi.get<Question>(`/questions/${id}`);
export const createQuestion = (data: Partial<Question>) => QnaApi.post<number>('/questions', data);
export const updateQuestion = (id: number, data: Partial<Question>) => QnaApi.put(`/questions/${id}`, data);
export const deleteQuestion = (id: number) => QnaApi.delete(`/questions/${id}`);
export const increaseView = (id: number) => QnaApi.post(`/questions/${id}/view`);
export const increaseLike = (id: number) => QnaApi.post(`/questions/${id}/like`);

// ---------------- Answers ----------------
export const getAnswers = (questionId: number, page = 0, size = 10) =>
    QnaApi.get<{ content: Answer[]; totalPages: number }>('/answers', { params: { questionId, page, size } });

export const createAnswer = (data: Partial<Answer>) => QnaApi.post<number>('/answers', data);
export const updateAnswer = (id: number, data: Partial<Answer>) => QnaApi.put(`/answers/${id}`, data);
export const deleteAnswer = (id: number) => QnaApi.delete(`/answers/${id}`);

export const voteAnswer = (id: number, vote: VoteRequest) => QnaApi.post(`/answers/${id}/votes`, vote);
export const reportAnswer = (id: number, report: ReportRequest) => QnaApi.post(`/answers/${id}/reports`, report);

export default QnaApi;
