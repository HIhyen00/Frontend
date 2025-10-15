import React, { useEffect, useState } from "react";
import QnaApi  from "../utils/QnaApi";
import type { Answer, Question } from "../types/qna";
import { FaTimes, FaThumbsUp, FaThumbsDown, FaFlag, FaEdit, FaTrash, FaPaperPlane } from "react-icons/fa";

interface Props {
    questionId: number;
    onClose: () => void;
}

const QuestionDetailModal: React.FC<Props> = ({ questionId, onClose }) => {
    const [question, setQuestion] = useState<Question | null>(null);
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState("");
    const [newAnswer, setNewAnswer] = useState("");

    useEffect(() => {
        document.body.style.overflow = "hidden";
        return () => { document.body.style.overflow = "auto"; };
    }, []);

    useEffect(() => {
        fetchQuestionDetail();
    }, [questionId]);

    const fetchQuestionDetail = async () => {
        try {
            const q = await QnaApi.getQuestion(questionId);
            setQuestion(q);

            const a = await QnaApi.getAnswers(questionId);
            setAnswers(a.content);
        } catch (e) {
            console.error(e);
        }
    };

    // 질문 좋아요
    const handleQuestionVote = async () => {
        if (!question) return;
        try {
            await QnaApi.voteAnswer(question.id, "UP"); // QnaApi에서 질문 투표 엔드포인트 필요
            fetchQuestionDetail();
        } catch (e) {
            console.error(e);
        }
    };

    const handleVote = async (answerId: number, type: "UP" | "DOWN") => {
        try {
            await QnaApi.voteAnswer(answerId, type);
            fetchQuestionDetail();
        } catch (e) {
            console.error(e);
        }
    };

    const handleReport = async (answerId: number) => {
        const reason = prompt("신고 사유를 입력해주세요");
        if (!reason) return;
        try {
            await QnaApi.reportAnswer(answerId, reason);
            alert("신고 완료");
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (answerId: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await QnaApi.deleteAnswer(answerId);
            fetchQuestionDetail();
        } catch (e) {
            console.error(e);
        }
    };

    const handleEdit = (answer: Answer) => {
        setEditingAnswerId(answer.id);
        setEditingContent(answer.content || "");
    };

    const handleEditSubmit = async (answerId: number) => {
        try {
            await QnaApi.updateAnswer(answerId, { content: editingContent });
            setEditingAnswerId(null);
            setEditingContent("");
            fetchQuestionDetail();
        } catch (e) {
            console.error(e);
        }
    };

    const handleCreateAnswer = async () => {
        if (!newAnswer.trim()) return;
        try {
            await QnaApi.createAnswer({ questionId, content: newAnswer, isPrivate: false });
            setNewAnswer("");
            fetchQuestionDetail();
        } catch (e) {
            console.error(e);
        }
    };

    if (!question) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-start bg-black bg-opacity-50 p-4 pt-20">
            <div className="bg-white w-full max-w-4xl rounded shadow-lg p-6 relative max-h-[80vh] overflow-auto">
                {/* 닫기 버튼 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <FaTimes size={24} />
                </button>

                {/* 질문 영역 */}
                <h2 className="text-3xl font-bold mb-2">{question.title}</h2>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-700 text-lg whitespace-pre-wrap">{question.content}</p>
                    <button
                        onClick={handleQuestionVote}
                        className="flex items-center gap-1 text-green-500 border border-green-500 px-3 py-1 rounded hover:bg-green-50"
                    >
                        <FaThumbsUp /> {question.likeCount || 0}
                    </button>
                </div>

                <hr className="my-4" />

                {/* 답변 리스트 */}
                <h3 className="text-2xl font-semibold mb-4">답변</h3>
                <div className="space-y-4 mb-6">
                    {answers.map((a) => (
                        <div
                            key={a.id}
                            className="border rounded-lg p-4 bg-white shadow-sm hover:shadow-md transition"
                        >
                            {editingAnswerId === a.id ? (
                                <>
                                    <textarea
                                        className="w-full border rounded p-3 text-lg mb-2"
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            className="px-4 py-2 bg-purple-500 text-white rounded"
                                            onClick={() => handleEditSubmit(a.id)}
                                        >
                                            저장
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-gray-300 rounded"
                                            onClick={() => setEditingAnswerId(null)}
                                        >
                                            취소
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-800 text-lg mb-2">{a.content}</p>
                                    <div className="flex flex-wrap gap-3 text-sm mt-2">
                                        <button
                                            className="flex items-center gap-1 text-green-500"
                                            onClick={() => handleVote(a.id, "UP")}
                                        >
                                            <FaThumbsUp /> {a.upvoteCount}
                                        </button>
                                        <button
                                            className="flex items-center gap-1 text-red-500"
                                            onClick={() => handleVote(a.id, "DOWN")}
                                        >
                                            <FaThumbsDown /> {a.downvoteCount}
                                        </button>
                                        <button
                                            className="flex items-center gap-1 text-yellow-600"
                                            onClick={() => handleReport(a.id)}
                                        >
                                            <FaFlag /> 신고
                                        </button>
                                        <button
                                            className="flex items-center gap-1 text-blue-500"
                                            onClick={() => handleEdit(a)}
                                        >
                                            <FaEdit /> 수정
                                        </button>
                                        <button
                                            className="flex items-center gap-1 text-red-600"
                                            onClick={() => handleDelete(a.id)}
                                        >
                                            <FaTrash /> 삭제
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* 답변 작성 */}
                <div className="mt-6">
                    <h4 className="text-xl font-semibold mb-2">답변 작성</h4>
                    <textarea
                        className="w-full border rounded p-4 text-lg h-36"
                        placeholder="답변을 작성하세요"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleCreateAnswer}
                            className="flex items-center gap-2 bg-purple-500 text-white px-6 py-2 rounded hover:bg-purple-600"
                        >
                            <FaPaperPlane /> 작성
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuestionDetailModal;
