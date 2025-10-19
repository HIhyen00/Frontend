import axios from 'axios';
import { setupAxiosInterceptors } from '../../shared/utils/axiosInterceptors';
import type { Question, Answer, VoteRequest, ReportRequest } from '../types/qna';

const API_BASE_URL = import.meta.env.VITE_QNA_API_BASE_URL || "http://localhost:8004/api";

const QnaApi = axios.create({
    baseURL: API_BASE_URL,
    headers: { "Content-Type": "application/json" },
    withCredentials: true,
});

// 공통 인터셉터 설정 (토큰 자동 추가 및 401 처리)
setupAxiosInterceptors(QnaApi);

// ---------------- Questions ----------------
export const getQuestions = (category?: string, sort?: string, page = 0, size = 10) =>
    QnaApi.get<{ content: Question[]; totalPages: number }>('/qna/questions', { params: { category, sort, page, size } });

export const getQuestion = (id: number) => QnaApi.get<Question>(`/qna/questions/${id}`);
export const createQuestion = (data: Partial<Question>) => QnaApi.post<number>('/qna/questions', data);
export const updateQuestion = (id: number, data: Partial<Question>) => QnaApi.put(`/qna/questions/${id}`, data);
export const deleteQuestion = (id: number) => QnaApi.delete(`/qna/questions/${id}`);
export const increaseView = (id: number) => QnaApi.post(`/qna/questions/${id}/view`);
export const increaseLike = (id: number) => QnaApi.post(`/qna/questions/${id}/like`);

// ---------------- Answers ----------------
export const getAnswers = (questionId: number, page = 0, size = 10) =>
    QnaApi.get<{ content: Answer[]; totalPages: number }>('/qna/answers', { params: { questionId, page, size } });

export const createAnswer = (data: Partial<Answer>) => QnaApi.post<number>('/qna/answers', data);
export const updateAnswer = (id: number, data: Partial<Answer>) => QnaApi.put(`/qna/answers/${id}`, data);
export const deleteAnswer = (id: number) => QnaApi.delete(`/qna/answers/${id}`);

export const voteAnswer = (id: number, vote: VoteRequest) => QnaApi.post(`/qna/answers/${id}/votes`, vote);
export const reportAnswer = (id: number, report: ReportRequest) => QnaApi.post(`/qna/answers/${id}/reports`, report);

export default QnaApi;
