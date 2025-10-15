import React, { useEffect, useState } from "react";
import  QnaApi  from "../utils/QnaApi";
import type { Question } from "../types/qna";
import QnaHeader from "../components/QnaHeader";
import CategoryTabs from "../components/CategoryTabs";
import PostCard from "../components/PostCard";
import QuestionDetailModal from "../components/QuestionDetailModal";

const QnaPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [category, setCategory] = useState<string | undefined>();
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null);
    const pageSize = 5;
    const [sort, setSort] = useState("recommended");

    const fetchQuestions = async () => {
        try {
            const data = await QnaApi.getQuestions({ category, sort, page, size: pageSize });
            setQuestions(data.content);
            setTotalPages(Math.ceil(data.totalElements / pageSize));
        } catch (e) {
            console.error(e);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [category, page, sort]);

    const handleCategoryChange = (newCategory: string | undefined) => {
        setCategory(newCategory);
        setPage(0);
    };

    const handlePageChange = (newPage: number) => {
        setPage(newPage);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(0, page - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage < maxVisiblePages - 1) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-4 py-2 rounded-lg transition-all ${
                        page === i ? "bg-purple-500 text-white font-bold" : "text-gray-700 hover:bg-gray-100"
                    }`}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className="w-full pt-14">
            <div className="max-w-7xl mx-auto px-6 py-8">
                <QnaHeader onCreated={fetchQuestions} />
                <CategoryTabs activeCategory={category} setActiveCategory={handleCategoryChange} sortValue={sort}
                              onSortChange={(value) => setSort(value)}/>

                <div className="mt-6 space-y-4">
                    {questions.map((q) => (
                        <PostCard key={q.id} question={q} onClick={() => setSelectedQuestionId(q.id)} />
                    ))}
                </div>

                {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-8">
                        <button
                            onClick={() => handlePageChange(page - 1)}
                            disabled={page === 0}
                            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            이전
                        </button>
                        {renderPageNumbers()}
                        <button
                            onClick={() => handlePageChange(page + 1)}
                            disabled={page === totalPages - 1}
                            className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            다음
                        </button>
                    </div>
                )}
            </div>

            {selectedQuestionId && (
                <QuestionDetailModal
                    questionId={selectedQuestionId}
                    onClose={() => setSelectedQuestionId(null)}
                />
            )}
        </div>
    );
};

export default QnaPage;
