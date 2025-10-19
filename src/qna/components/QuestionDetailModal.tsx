import React, { useEffect, useState } from "react";
import type { Question, Answer } from "../types/qna";
import { getAnswers, createAnswer, updateAnswer, deleteAnswer, voteAnswer, reportAnswer } from "../utils/QnaApi";

interface Props {
    question: Question;
    currentUserId?: number;
    onClose: () => void;
}

const QuestionDetailModal: React.FC<Props> = ({ question, currentUserId, onClose }) => {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [newContent, setNewContent] = useState("");
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState("");

    const fetchAnswers = async () => {
        try {
            const res = await getAnswers(question.id, 0, 10);
            setAnswers(res.data.content);
        } catch (err: any) {
            console.error("답변 로드 실패", err);
        }
    };

    useEffect(() => {
        fetchAnswers();
    }, [question.id]);

    const handleCreate = async () => {
        if (!newContent.trim()) return;
        try {
            await createAnswer({ questionId: question.id, content: newContent, isPrivate: false });
            setNewContent("");
            fetchAnswers();
        } catch (err: any) {
            console.error("답변 작성 실패", err);
        }
    };

    const handleUpdate = async (id: number) => {
        if (!editingContent.trim()) return;
        try {
            await updateAnswer(id, { content: editingContent, isPrivate: false });
            setEditingId(null);
            fetchAnswers();
        } catch (err: any) {
            console.error("답변 수정 실패", err);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("답변을 삭제하시겠습니까?")) return;
        try {
            await deleteAnswer(id);
            fetchAnswers();
        } catch (err: any) {
            console.error("답변 삭제 실패", err);
        }
    };

    const handleVote = async (id: number, type: "UP" | "DOWN") => {
        try {
            await voteAnswer(id, { type });
            fetchAnswers();
        } catch (err: any) {
            console.error("투표 실패", err);
        }
    };

    const handleReport = async (id: number) => {
        const reason = prompt("신고 사유를 입력하세요.");
        if (!reason) return;
        try {
            await reportAnswer(id, { reason });
            fetchAnswers();
        } catch (err: any) {
            console.error("신고 실패", err);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-start z-50 p-4"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-3xl w-11/12 md:w-2/3 max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-gray-100 mt-20"
                onClick={(e) => e.stopPropagation()} // 모달 내부 클릭 시 닫기 방지
            >
                {/* 닫기 버튼 */}
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                    onClick={onClose}
                >
                    ✕
                </button>

                {/* 질문 */}
                <h2 className="text-2xl font-bold mb-2">{question.title}</h2>
                <p className="text-gray-700 mb-4">{question.content}</p>

                {/* 답변 섹션 */}
                <h3 className="mt-6 mb-2 text-lg font-semibold border-b pb-1">답변 ({answers.length})</h3>
                <div className="space-y-3">
                    {answers.length === 0 && <p className="text-gray-500">답변이 없습니다.</p>}
                    {answers.map((a) => (
                        <div key={a.id} className="p-4 border border-gray-200 rounded-2xl bg-white shadow-sm">
                            {editingId === a.id ? (
                                <div>
                  <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm shadow-sm mb-3"
                      rows={3}
                  />
                                    <div className="flex gap-2">
                                        <button
                                            className="px-4 py-2 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 font-semibold text-sm transition-all shadow-md active:scale-95"
                                            onClick={() => handleUpdate(a.id)}
                                        >
                                            저장
                                        </button>
                                        <button
                                            className="px-4 py-2 bg-gray-100 text-gray-900 rounded-2xl hover:bg-gray-200 font-semibold text-sm transition-all active:scale-95"
                                            onClick={() => setEditingId(null)}
                                        >
                                            취소
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="mb-1">{a.content}</p>
                                    <small className="text-gray-400">작성자 ID: {a.userId}</small>
                                    <div className="mt-2 flex flex-wrap gap-2 text-sm">
                                        <button
                                            className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all font-medium"
                                            onClick={() => handleVote(a.id, "UP")}
                                        >
                                            👍 {a.upvoteCount}
                                        </button>
                                        <button
                                            className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all font-medium"
                                            onClick={() => handleVote(a.id, "DOWN")}
                                        >
                                            👎 {a.downvoteCount}
                                        </button>
                                        <button
                                            className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 rounded-xl hover:bg-red-100 transition-all font-medium"
                                            onClick={() => handleReport(a.id)}
                                        >
                                            ⚠️ 신고
                                        </button>
                                        {currentUserId === a.userId && (
                                            <>
                                                <button
                                                    className="px-3 py-1.5 bg-blue-50 border border-blue-200 text-blue-700 rounded-xl hover:bg-blue-100 transition-all font-medium"
                                                    onClick={() => {
                                                        setEditingId(a.id);
                                                        setEditingContent(a.content);
                                                    }}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className="px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-xl hover:bg-gray-200 transition-all font-medium"
                                                    onClick={() => handleDelete(a.id)}
                                                >
                                                    삭제
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 새 답변 작성 */}
                <div className="mt-6">
          <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="답변을 작성하세요..."
              className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm shadow-sm mb-3"
              rows={4}
          />
                    <button
                        onClick={handleCreate}
                        className="px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-semibold shadow-lg active:scale-95"
                    >
                        답변 작성
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionDetailModal;
