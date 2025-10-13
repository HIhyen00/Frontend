import React, { useState } from "react";
import { FaPlus, FaPaw } from "react-icons/fa";
import QuestionCreateModal from "./QuestionCreateModal";

interface Props {
    onCreated: () => void; // 질문 작성 후 리스트 새로고침
}

const QnaHeader: React.FC<Props> = ({ onCreated }) => {
    const [openCreateModal, setOpenCreateModal] = useState(false);

    return (
        <>
            <div className="flex justify-between items-center pt-15 pb-6 px-12 bg-white sticky top-0 z-20 border-b">
                <div className="flex items-center gap-2">
                    <FaPaw size={24} className="text-purple-600" />
                    <h1 className="text-2xl font-bold text-purple-600">MyRealPet 커뮤니티</h1>
                </div>

                <button
                    onClick={() => setOpenCreateModal(true)}
                    className="flex items-center gap-2 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
                >
                    <FaPlus size={16} />
                    질문하기
                </button>
            </div>

            {openCreateModal && (
                <QuestionCreateModal
                    onClose={() => setOpenCreateModal(false)}
                    onCreated={onCreated}
                />
            )}
        </>
    );
};

export default QnaHeader;
