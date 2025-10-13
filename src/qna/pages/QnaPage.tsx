import React, { useEffect, useState } from "react";
import { getQuestions } from "../utils/QnaApi";
import type { Question } from "../types/qna";
import QnaHeader from "../components/QnaHeader";
import CategoryTabs from "../components/CategoryTabs";
import PostCard from "../components/PostCard";

const sortOptions: { value: string; label: string }[] = [
    { value: "latest", label: "최신순" },
    { value: "recommended", label: "추천순" },
    { value: "popular", label: "조회순" },
];

const QnaPage: React.FC = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [category, setCategory] = useState<string | undefined>();
    const [sort, setSort] = useState("latest");

    useEffect(() => {
        fetchQuestions();
    }, [category, sort]);

    const fetchQuestions = async () => {
        try {
            const data = await getQuestions({ category, sort, page: 0, size: 10 });
            setQuestions(data.content);
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div className="min-h-screen py-8 px-12 bg-gray-50">
            {/* 헤더 + 질문하기 */}
            <QnaHeader onCreated={fetchQuestions} />

            {/* 카테고리 탭 */}
            <CategoryTabs activeCategory={category} setActiveCategory={setCategory} />

            {/* 페이지 상단 정렬 드롭다운 */}
            <div className="mt-4 flex justify-end px-12">
                <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    className="border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                    {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* 질문 리스트 */}
            <div className="mt-6 space-y-6 px-12">
                {questions.map((q) => (
                    <PostCard key={q.id} question={q} />
                ))}
            </div>
        </div>
    );
};

export default QnaPage;
