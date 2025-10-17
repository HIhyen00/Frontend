import React, { useState } from "react";
import { FaRegThumbsUp } from "react-icons/fa6";
import type { Question } from "../types/qna";
import QuestionDetailModal from "./QuestionDetailModal";
import { increaseView, increaseLike } from "../utils/QnaApi";

interface Props {
    question: Question;
}

const QuestionCard: React.FC<Props> = ({ question }) => {
    const [likes, setLikes] = useState(question.stats?.likeCount ?? 0);
    const [viewCount, setViewCount] = useState(question.stats?.viewCount ?? 0);
    const [answers, setAnswers] = useState<number>(question.stats?.answerCount ?? 0);
    const [modalOpen, setModalOpen] = useState(false);

    const handleCardClick = async () => {
        try {
            await increaseView(question.id);
            const newView = viewCount + 1;
            setViewCount(newView);
            setModalOpen(true);
        } catch (err) {
            console.error("조회수 증가 실패", err);
        }
    };

    const handleLikeClick = async (e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            await increaseLike(question.id);
            const newLikes = likes + 1;
            setLikes(newLikes);
        } catch (err) {
            console.error("좋아요 증가 실패", err);
        }
    };

    // 모달과 동기화
    const handleModalStatsChange = (newLikes: number, newViews: number, newAnswers?: number) => {
        setLikes(newLikes);
        setViewCount(newViews);
        if (newAnswers !== undefined) setAnswers(newAnswers);
    };

    return (
        <>
            <div
                className="relative bg-white border rounded-lg p-4 shadow hover:shadow-lg cursor-pointer transition"
                onClick={handleCardClick}
            >
                <div className="absolute top-2 right-2 text-sm text-gray-400">{question.category}</div>
                <h3 className="text-xl font-semibold mb-2">{question.title}</h3>
                <p className="text-gray-700 mb-12">{question.content}</p>
                <div className="absolute bottom-2 right-2 flex items-center gap-3 text-sm text-gray-500">
                    <span>조회수: {viewCount}</span>
                    <span>답변수: {answers}</span>
                    <button
                        className="flex items-center gap-1 px-2 py-1 text-gray-500"
                        onClick={handleLikeClick}
                    >
                        <FaRegThumbsUp /> {likes}
                    </button>
                </div>
            </div>

            {modalOpen && (
                <QuestionDetailModal
                    question={question}
                    currentUserId={question.userId}
                    onClose={() => setModalOpen(false)}
                    onStatsChange={handleModalStatsChange}
                />
            )}
        </>
    );
};

export default QuestionCard;
