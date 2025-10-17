import React from "react";
import type { Question } from "../types/qna";

interface Props {
    question: Question;
    onClick: () => void;
    onEdit: (q: Question) => void;
    onDelete: (q: Question) => void;
}

const QuestionCard: React.FC<Props> = ({ question, onClick, onEdit, onDelete }) => {
    return (
        <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md cursor-pointer transition">
            {/* 제목 + 버튼 */}
            <div className="flex justify-between items-start mb-2">
                <h3
                    className="font-semibold text-sm truncate max-w-[70%]"
                    onClick={onClick}
                    title={question.title}
                >
                    {question.title}
                </h3>
                <div className="flex space-x-2">
                    <button
                        onClick={() => onEdit(question)}
                        className="text-blue-500 text-xs hover:underline"
                    >
                        수정
                    </button>
                    <button
                        onClick={() => onDelete(question)}
                        className="text-red-500 text-xs hover:underline"
                    >
                        삭제
                    </button>
                </div>
            </div>

            {/* 내용 */}
            <p className="text-gray-600 text-xs mb-2 truncate" title={question.content}>
                {question.content}
            </p>

            {/* 통계 */}
            <div className="flex justify-between text-[10px] text-gray-400">
                <span>조회 {question.stats?.viewCount || 0}</span>
                <span>추천 {question.stats?.likeCount || 0}</span>
                <span>답변 {question.stats?.answerCount || 0}</span>
            </div>
        </div>
    );
};

export default QuestionCard;
