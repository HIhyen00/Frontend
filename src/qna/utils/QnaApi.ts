import { get, post, put, del } from "./axiosConfig";
import type { Question, Answer } from "../types/qna";

const QnaApi = {
    // Questions
    getQuestions: (params?: { category?: string; sort?: string; page?: number; size?: number }) =>
        get<{ content: Question[]; totalElements: number }>("/questions", params),

    getQuestion: (id: number) => get<Question>(`/questions/${id}`),
    createQuestion: (data: { title: string; content: string; category?: string }) =>
        post<number>("/questions", data),
    updateQuestion: (id: number, data: { title?: string; content?: string; category?: string }) =>
        put<void>(`/questions/${id}`, data),
    deleteQuestion: (id: number) => del(`/questions/${id}`),

    // Answers
    getAnswers: (questionId: number, page = 0, size = 10) =>
        get<{ content: Answer[]; totalElements: number }>("/answers", { questionId, page, size }),
    createAnswer: (data: { questionId: number; content: string; isPrivate?: boolean }) =>
        post<number>("/answers", data),
    updateAnswer: (id: number, data: { content?: string; isPrivate?: boolean }) =>
        put<void>(`/answers/${id}`, data),
    deleteAnswer: (id: number) => del(`/answers/${id}`),
    voteAnswer: (id: number, type: "UP" | "DOWN") => post<void>(`/answers/${id}/votes`, { type }),
    reportAnswer: (id: number, reason: string) => post<void>(`/answers/${id}/reports`, { reason }),
};

export default QnaApi;
