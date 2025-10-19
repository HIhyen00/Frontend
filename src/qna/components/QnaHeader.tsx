import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import QuestionCreateModal from "./QuestionForm";

interface Props {
    onCreated: () => void; // 질문 작성 후 리스트 새로고침
}

const QnaHeader: React.FC<Props> = ({ onCreated }) => {
    const [openCreateModal, setOpenCreateModal] = useState(false);

    return (
        <>
            <div className="flex justify-between items-center pt-3 pb-3 px-5 rounded-lg bg-white sticky top-0 z-20">
                <h1 className="text-2xl font-bold ml-2 text-gray-900">Q&A</h1>
                <button
                    onClick={() => setOpenCreateModal(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-full font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 transition duration-300 flex items-center group"
                >
                    <FaPlus size={16} />
                    질문하기
                </button>
            </div>

            {openCreateModal && (
                <QuestionCreateModal
                    onClose={() => setOpenCreateModal(false)}
                    onSubmit={onCreated}
                />
            )}
        </>
    );
};

export default QnaHeader;