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
            onSubmit();
            onClose();
        } catch (err: any) {
            alert(err.response?.data?.message || "실패");
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded w-[700px]">
                <h2 className="text-lg font-bold mb-4">{question ? "질문 수정" : "질문 작성"}</h2>
                <input
                    type="text"
                    placeholder="제목"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full border px-4 py-3 mb-4"
                    required
                />
                <textarea
                    placeholder="내용"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full border px-4 py-3 mb-4"
                    rows={8}
                    required
                />
                <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full border px-4 py-3 mb-4"
                >
                    <option value="일상">일상</option>
                    <option value="궁금해요">궁금해요</option>
                    <option value="기타">기타</option>
                </select>
                <div className="flex justify-end space-x-3">
                    <button type="button" onClick={onClose} className="px-5 py-2 border rounded">취소</button>
                    <button type="submit"
                            className="px-5 py-2 bg-purple-500 text-white rounded">{question ? "수정" : "작성"}</button>
                </div>
            </form>

        </div>
    );
};

export default QuestionForm;
