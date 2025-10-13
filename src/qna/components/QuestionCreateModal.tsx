import React, { useState } from "react";
import { api } from "../utils/QnaApi";
import { FaTimes } from "react-icons/fa";

interface Props {
    onClose: () => void;
    onCreated: () => void; // 질문 작성 후 리스트 새로고침
}

const categories = ["전체","일상", "궁금해요", "기타"];

const QuestionCreateModal: React.FC<Props> = ({ onClose, onCreated }) => {
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [category, setCategory] = useState(categories[0]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !content.trim()) {
            alert("제목과 내용을 입력해주세요.");
            return;
        }
        setLoading(true);
        try {
            await api.post("/questions", { title, content, category });
            setLoading(false);
            onCreated();
            onClose();
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-start overflow-auto pt-20">
            <div className="bg-white w-full max-w-4xl rounded shadow-lg p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
                >
                    <FaTimes size={24} />
                </button>

                <h2 className="text-3xl font-bold mb-6">질문 작성</h2>

                <div className="flex flex-col gap-6">
                    <input
                        type="text"
                        className="border rounded px-4 py-3 w-full text-lg"
                        placeholder="제목을 입력하세요"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                    />
                    <textarea
                        className="border rounded px-4 py-3 w-full h-60 text-lg"
                        placeholder="내용을 입력하세요"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    <select
                        className="border rounded px-4 py-3 w-full text-lg"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-purple-500 text-white px-6 py-3 rounded text-lg hover:bg-purple-600"
                    >
                        {loading ? "작성 중..." : "작성 완료"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default QuestionCreateModal;
