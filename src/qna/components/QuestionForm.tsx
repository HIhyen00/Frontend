import React, {useState} from "react";
import {createQuestion, updateQuestion} from "../utils/QnaApi";
import type {Question} from "../types/qna";

interface Props {
    question?: Question,
    onClose: () => void,
    onSubmit: () => void,
    onCreated?: unknown
}

const QuestionForm: React.FC<Props> = ({question, onClose, onSubmit, onCreated}) => {
    const [title, setTitle] = useState(question?.title || "");
    const [content, setContent] = useState(question?.content || "");
    const [category, setCategory] = useState(question?.category || "일상");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (question) {
                await updateQuestion(question.id, {title, content, category});
            } else {
                await createQuestion({title, content, category});
            }
            onSubmit(); // 목록 새로고침
            onClose(); // 모달 닫기
        } catch (err: any) {
            console.error('질문 작성/수정 에러:', err);
            alert(err.response?.data?.message || err.koreanMessage || "작성에 실패했습니다.");
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-6 w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-800 mb-6">{question ? "질문 수정" : "질문 작성"}</h2>
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">제목</label>
                    <input
                        type="text"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm shadow-sm"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">내용</label>
                    <textarea
                        placeholder="내용을 입력하세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm shadow-sm"
                        rows={8}
                        required
                    />
                </div>
                <div className="mb-6">
                    <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">카테고리</label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm shadow-sm appearance-none bg-white"
                    >
                        <option value="일상">일상</option>
                        <option value="궁금해요">궁금해요</option>
                        <option value="기타">기타</option>
                    </select>
                </div>
                <div className="flex gap-3">
                    <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-semibold text-sm transition-all active:scale-95">취소</button>
                    <button type="submit"
                            className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95">{question ? "수정" : "작성"}</button>
                </div>
            </form>

        </div>
    );
};

export default QuestionForm;
