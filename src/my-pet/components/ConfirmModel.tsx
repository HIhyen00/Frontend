interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
    // isOpen이 false면 아무것도 렌더링하지 않아.
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50" onClick={onClose}>
            {/* 실제 모달 창 부분 */}
            <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 p-8 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{title}</h2>
                <p className="text-gray-600 mb-8 text-center">{message}</p>

                {/* '예', '아니요' 버튼 */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                    >
                        아니요
                    </button>
                    <button
                        onClick={onConfirm}
                        className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95"
                    >
                        예
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;

