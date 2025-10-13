import React, { useState } from "react";
import type { Question } from "../types/qna";
import { FaHeart, FaBookOpen, FaCommentDots } from "react-icons/fa";
import QuestionDetailModal from "./QuestionDetailModal";

interface Props {
    question: Question;
}

const PostCard: React.FC<Props> = ({ question }) => {
    const [openModal, setOpenModal] = useState(false);

    return (
        <>
            <div
                className="bg-white p-4 rounded shadow cursor-pointer hover:shadow-md transition"
                onClick={() => setOpenModal(true)}
            >
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-bold">{question.title}</h3>
                    <span className="text-sm text-gray-500">{question.category}</span>
                </div>
                <p className="text-gray-700 line-clamp-3">{question.content}</p>
                <div className="flex gap-4 text-sm text-gray-500 mt-2">
                    <FaBookOpen /><span>조회수: {question.viewCount}</span>
                    <FaHeart /><span>좋아요: {question.likeCount}</span>
                    <FaCommentDots /><span>답변: {question.answerCount}</span>
                </div>
            </div>

            {openModal && (
                <QuestionDetailModal
                    questionId={question.id}
                    onClose={() => setOpenModal(false)}
                />
            )}
        </>
    );
};

export default PostCard;
