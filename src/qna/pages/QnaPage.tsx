import React, { useState, useEffect } from "react";
import type { Question } from "../types/qna";
import { getQuestions, deleteQuestion } from "../utils/QnaApi";

import QnaHeader from "../components/QnaHeader";
import CategoryTabs from "../components/CategoryTabs";
import QuestionCard from "../components/QuestionCard";
import QuestionForm from "../components/QuestionForm";
import QuestionDetailModal from "../components/QuestionDetailModal";
import Pagination from "../components/Pagination";

const QnaPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [category, setCategory] = useState<string | undefined>(undefined);
    const [sort, setSort] = useState<string>("latest");
    const [page, setPage] = useState<number>(0);
    const [totalPages, setTotalPages] = useState<number>(1);
    const cardsPerPage = 5;

    // API에서 질문 가져오기
    const fetchQuestions = async () => {
        try {
            const res = await getQuestions(category, sort, page, cardsPerPage);
            setQuestions(res.data.content);
            setTotalPages(res.data.totalPages || 1);
        } catch (err: any) {
            alert(err.koreanMessage || "질문 로드 실패");
        }
    };

    useEffect(() => {
        setPage(0); // 카테고리/정렬 변경 시 페이지 초기화
    }, [category, sort]);

    useEffect(() => {
        fetchQuestions();
    }, [category, sort, page]);

    const handleDelete = async (q: Question) => {
        if (!confirm("질문을 삭제하시겠습니까?")) return;
        try {
            await deleteQuestion(q.id);
            fetchQuestions();
        } catch (err: any) {
            alert(err.koreanMessage || "삭제 실패");
        }
    };

    return (
        <div className="container mx-auto px-35 py-20">
            {/* 헤더 */}
            <QnaHeader />

            {/* 카테고리 + 정렬 */}
            <CategoryTabs
                activeCategory={category}
                setActiveCategory={setCategory}
                sortValue={sort}
                onSortChange={setSort}
            />

            {/* 질문 작성/수정 폼 */}
            {showCreate && (
                <QuestionForm
                    onClose={() => setShowCreate(false)}
                    onSubmit={fetchQuestions}
                />
            )}
            {editingQuestion && (
                <QuestionForm
                    question={editingQuestion}
                    onClose={() => setEditingQuestion(null)}
                    onSubmit={fetchQuestions}
                />
            )}


            {/* 질문 카드 목록 */}
            <div className="space-y-4 pt-10">
                {questions.map((q) => (
                    <QuestionCard
                        key={q.id}
                        question={q}
                        onClick={() => setSelectedQuestion(q)}
                        onEdit={(q) => setEditingQuestion(q)}
                        onDelete={handleDelete}
                    />
                ))}
            </div>

            {/* 페이지네이션 */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(p - 1, 0))}
                        disabled={page === 0}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        이전
                    </button>
                    <span className="px-2 text-sm">
            {page + 1} / {totalPages}
          </span>
                    <button
                        onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
                        disabled={page === totalPages - 1}
                        className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        다음
                    </button>
                </div>
            )}

            {/* 질문 상세 모달 */}
            {selectedQuestion && (
                <QuestionDetailModal
                    question={selectedQuestion}
                    onClose={() => setSelectedQuestion(null)}
                    currentUserId={1} // 실제 로그인 유저 ID
                />
            )}
        </div>
    );
};

export default QnaPage;
