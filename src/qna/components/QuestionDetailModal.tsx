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
            className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-start z-50"
            onClick={onClose}
        >
            <div
                className="relative bg-white rounded-lg w-11/12 md:w-2/3 max-h-[80vh] overflow-y-auto p-6 shadow-lg"
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
                        <div key={a.id} className="p-3 border rounded bg-gray-50">
                            {editingId === a.id ? (
                                <div>
                  <textarea
                      value={editingContent}
                      onChange={(e) => setEditingContent(e.target.value)}
                      className="w-full border p-2 rounded mb-2"
                  />
                                    <div className="flex gap-2">
                                        <button
                                            className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                                            onClick={() => handleUpdate(a.id)}
                                        >
                                            저장
                                        </button>
                                        <button
                                            className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400"
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
                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                            onClick={() => handleVote(a.id, "UP")}
                                        >
                                            👍 {a.upvoteCount}
                                        </button>
                                        <button
                                            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                            onClick={() => handleVote(a.id, "DOWN")}
                                        >
                                            👎 {a.downvoteCount}
                                        </button>
                                        <button
                                            className="px-2 py-1 bg-red-200 rounded hover:bg-red-300"
                                            onClick={() => handleReport(a.id)}
                                        >
                                            ⚠️ 신고
                                        </button>
                                        {currentUserId === a.userId && (
                                            <>
                                                <button
                                                    className="px-2 py-1 bg-blue-200 rounded hover:bg-blue-300"
                                                    onClick={() => {
                                                        setEditingId(a.id);
                                                        setEditingContent(a.content);
                                                    }}
                                                >
                                                    수정
                                                </button>
                                                <button
                                                    className="px-2 py-1 bg-gray-300 rounded hover:bg-gray-400"
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
              className="w-full border p-3 rounded mb-2"
          />
                    <button
                        onClick={handleCreate}
                        className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                    >
                        답변 작성
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionDetailModal;
