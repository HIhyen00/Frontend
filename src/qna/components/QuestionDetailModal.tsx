import React, { useEffect, useState } from "react";
import type { Question, Answer, VoteRequest, ReportRequest } from "../types/qna";
import { getAnswers, createAnswer, updateAnswer, deleteAnswer, voteAnswer, reportAnswer } from "../utils/QnaApi";

interface Props {
    question: Question;
    onClose: () => void;
    currentUserId?: number;
}

const QuestionDetailModal: React.FC<Props> = ({ question, onClose, currentUserId }) => {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [newContent, setNewContent] = useState("");
    const [editingAnswerId, setEditingAnswerId] = useState<number | null>(null);
    const [editingContent, setEditingContent] = useState("");

    const fetchAnswers = async () => {
        try {
            const res = await getAnswers(question.id, 0, 10);
            setAnswers(res.data.content);
        } catch (err: any) {
            alert(err.koreanMessage || "답변 로드 실패");
        }
    };

    useEffect(() => {
        fetchAnswers();
    }, [question.id]);

    // 답변 작성
    const handleCreate = async () => {
        if (!newContent.trim()) return;
        try {
            await createAnswer({ questionId: question.id, content: newContent, isPrivate: false });
            setNewContent("");
            fetchAnswers();
        } catch (err: any) {
            alert(err.koreanMessage || "답변 작성 실패");
        }
    };

    // 답변 수정
    const handleUpdate = async (answerId: number) => {
        if (!editingContent.trim()) return;
        try {
            await updateAnswer(answerId, { content: editingContent, isPrivate: false });
            setEditingAnswerId(null);
            fetchAnswers();
        } catch (err: any) {
            alert(err.koreanMessage || "답변 수정 실패");
        }
    };

    // 답변 삭제
    const handleDelete = async (answerId: number) => {
        if (!confirm("답변을 삭제하시겠습니까?")) return;
        try {
            await deleteAnswer(answerId);
            fetchAnswers();
        } catch (err: any) {
            alert(err.koreanMessage || "삭제 실패");
        }
    };

    // 추천/반대
    const handleVote = async (answerId: number, type: "UP" | "DOWN") => {
        try {
            await voteAnswer(answerId, { type });
            fetchAnswers();
        } catch (err: any) {
            alert(err.koreanMessage || "투표 실패");
        }
    };

    // 신고
    const handleReport = async (answerId: number) => {
        const reason = prompt("신고 사유를 입력하세요.");
        if (!reason) return;
        try {
            await reportAnswer(answerId, { reason });
            fetchAnswers();
        } catch (err: any) {
            alert(err.koreanMessage || "신고 실패");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
            <div className="bg-white p-4 rounded w-11/12 md:w-2/3 max-h-[80vh] overflow-y-auto">
                <button className="float-right" onClick={onClose}>닫기</button>
                <h2 className="text-xl font-bold">{question.title}</h2>
                <p className="my-2">{question.content}</p>

                <h3 className="mt-4 font-semibold">답변</h3>
                <div className="space-y-2">
                    {answers.length === 0 && <p>답변이 없습니다.</p>}
                    {answers.map(a => (
                        <div key={a.id} className="p-2 border rounded">
                            {editingAnswerId === a.id ? (
                                <div>
                                    <textarea
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        className="w-full border p-1"
                                    />
                                    <button className="mr-2" onClick={() => handleUpdate(a.id)}>저장</button>
                                    <button onClick={() => setEditingAnswerId(null)}>취소</button>
                                </div>
                            ) : (
                                <div>
                                    <p>{a.content}</p>
                                    <small>작성자 ID: {a.userId}</small>
                                    <div className="mt-1 flex gap-2">
                                        <button onClick={() => handleVote(a.id, "UP")}>👍 {a.upvoteCount}</button>
                                        <button onClick={() => handleVote(a.id, "DOWN")}>👎 {a.downvoteCount}</button>
                                        <button onClick={() => handleReport(a.id)}>⚠️ 신고</button>
                                        {currentUserId === a.userId && (
                                            <>
                                                <button onClick={() => { setEditingAnswerId(a.id); setEditingContent(a.content); }}>수정</button>
                                                <button onClick={() => handleDelete(a.id)}>삭제</button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* 새 답변 작성 */}
                <div className="mt-4">
                    <textarea
                        value={newContent}
                        onChange={(e) => setNewContent(e.target.value)}
                        placeholder="답변을 작성하세요..."
                        className="w-full border p-2"
                    />
                    <button
                        onClick={handleCreate}
                        className="px-4 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
                    >
                        답변 작성
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionDetailModal;
