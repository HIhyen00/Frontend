import React, { useEffect, useState } from "react";
import { api } from "../utils/QnaApi";
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
        fetchQuestionDetail();
    }, [questionId]);

    const fetchQuestionDetail = async () => {
        try {
            const qRes = await api.get(`/questions/${questionId}`);
            setQuestion(qRes.data);

            const aRes = await api.get(`/answers?questionId=${questionId}`);
            setAnswers(aRes.data.content);
        } catch (e) {
            console.error(e);
        }
    };

    const handleVote = async (answerId: number, type: "UP" | "DOWN") => {
        try {
            await api.post(`/answers/${answerId}/votes`, { type });
            fetchQuestionDetail();
        } catch (e) {
            console.error(e);
        }
    };

    const handleReport = async (answerId: number) => {
        const reason = prompt("신고 사유를 입력해주세요");
        if (!reason) return;
        try {
            await api.post(`/answers/${answerId}/reports`, { reason });
            alert("신고 완료");
        } catch (e) {
            console.error(e);
        }
    };

    const handleDelete = async (answerId: number) => {
        if (!confirm("정말 삭제하시겠습니까?")) return;
        try {
            await api.delete(`/answers/${answerId}`);
            fetchQuestionDetail();
        } catch (e) {
            console.error(e);
        }
    };

    const handleEdit = (answer: Answer) => {
        setEditingAnswerId(answer.id);
        setEditingContent(answer.content);
    };

    const handleEditSubmit = async (answerId: number) => {
        try {
            await api.put(`/answers/${answerId}`, { content: editingContent });
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
            await api.post(`/answers`, { questionId, content: newAnswer, isPrivate: false });
            setNewAnswer("");
            fetchQuestionDetail();
        } catch (e) {
            console.error(e);
        }
    };

    if (!question) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-auto pt-20">
            <div className="bg-white w-full max-w-4xl rounded shadow-lg p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <FaTimes size={24} />
                </button>

                <h2 className="text-3xl font-bold mb-4">{question.title}</h2>
                <div className="border rounded p-4 bg-gray-50 min-h-[200px] mb-6 text-gray-700 text-lg whitespace-pre-wrap">
                    {question.content}
                </div>

                <hr className="my-6" />

                <h3 className="text-2xl font-semibold mb-4">답변</h3>

                {/* 답변 리스트 */}
                <div className="space-y-6 mb-6">
                    {answers.map((a) => (
                        <div key={a.id} className="border p-4 rounded relative">
                            {editingAnswerId === a.id ? (
                                <>
                                    <textarea
                                        className="w-full border rounded p-3 text-lg"
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                    />
                                    <div className="mt-3 flex gap-3">
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
                                    <p className="text-gray-800 text-lg">{a.content}</p>
                                    <div className="flex items-center gap-6 mt-3 text-sm">
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

                {/* 답변 작성 폼 */}
                <div className="mt-6">
                    <h4 className="text-xl font-semibold mb-2">답변 작성</h4>
                    <textarea
                        className="w-full border rounded p-4 text-lg h-40"
                        placeholder="답변을 작성하세요"
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                    />
                    <div className="mt-3 flex justify-end">
                        <button
                            onClick={handleCreateAnswer}
                            className="flex items-center gap-2 bg-purple-500 text-white px-6 py-3 rounded hover:bg-purple-600"
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
