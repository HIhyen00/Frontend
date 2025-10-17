import React, { useState, useEffect } from 'react';

interface ItemData {
    name: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    frequency?: string;
    days?: number;
    notes?: string;
}

interface MedicalRecordItemModalProps {
    type: 'test' | 'treatment' | 'medication';
    initialData?: ItemData;
    onSave: (data: ItemData) => void;
    onClose: () => void;
}

const MedicalRecordItemModal: React.FC<MedicalRecordItemModalProps> = ({
                                                                           type,
                                                                           initialData,
                                                                           onSave,
                                                                           onClose,
                                                                       }) => {
    const [name, setName] = useState('');
    const [quantity, setQuantity] = useState<number | ''>('');
    const [unitPrice, setUnitPrice] = useState<number | ''>('');
    const [amount, setAmount] = useState<number | ''>('');
    const [frequency, setFrequency] = useState('');
    const [days, setDays] = useState<number | ''>('');
    const [notes, setNotes] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name || '');
            setQuantity(initialData.quantity || '');
            setUnitPrice(initialData.unitPrice || '');
            setAmount(initialData.amount || '');
            setFrequency(initialData.frequency || '');
            setDays(initialData.days || '');
            setNotes(initialData.notes || '');
        }
    }, [initialData]);

    // 금액 자동 계산
    useEffect(() => {
        if (quantity && unitPrice) {
            const q = typeof quantity === 'number' ? quantity : parseInt(quantity);
            const p = typeof unitPrice === 'number' ? unitPrice : parseInt(unitPrice);
            setAmount(q * p);
        }
    }, [quantity, unitPrice]);

    const handleSubmit = () => {
        if (!name.trim()) {
            alert('항목 이름을 입력해주세요.');
            return;
        }

        const itemData: ItemData = {
            name: name.trim(),
            quantity: quantity ? (typeof quantity === 'number' ? quantity : parseInt(quantity)) : undefined,
            unitPrice: unitPrice ? (typeof unitPrice === 'number' ? unitPrice : parseInt(unitPrice)) : undefined,
            amount: amount ? (typeof amount === 'number' ? amount : parseInt(amount)) : undefined,
            notes: notes.trim() || undefined,
        };

        if (type === 'medication') {
            itemData.frequency = frequency.trim() || undefined;
            itemData.days = days ? (typeof days === 'number' ? days : parseInt(days)) : undefined;
        }

        onSave(itemData);
    };

    const getTitle = () => {
        switch (type) {
            case 'test': return '검사 항목';
            case 'treatment': return '처치 항목';
            case 'medication': return '처방 항목';
            default: return '항목';
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div
                className="fixed inset-0 bg-black bg-opacity-50"
                onClick={onClose}
            ></div>

            <div className="relative bg-white rounded-lg w-full max-w-md mx-4 z-10">
                <div className="px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-800">
                        {getTitle()} {initialData ? '수정' : '추가'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <i className="fas fa-times"></i>
                    </button>
                </div>

                <div className="p-6">
                    {/* 항목 이름 */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            항목 이름 *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="항목 이름을 입력하세요"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* medication 타입일 때만 복용 빈도와 처방일수 표시 */}
                    {type === 'medication' && (
                        <>
                            {/* 복용 빈도 */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    복용 빈도
                                </label>
                                <input
                                    type="text"
                                    value={frequency}
                                    onChange={(e) => setFrequency(e.target.value)}
                                    placeholder="예: 1일 2회"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            {/* 처방일수 */}
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    처방일수
                                </label>
                                <input
                                    type="number"
                                    value={days}
                                    onChange={(e) => setDays(e.target.value ? parseInt(e.target.value) : '')}
                                    placeholder="처방일수를 입력하세요"
                                    min="1"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </>
                    )}

                    {/* 수량 */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            수량
                        </label>
                        <input
                            type="number"
                            value={quantity}
                            onChange={(e) => setQuantity(e.target.value ? parseInt(e.target.value) : '')}
                            placeholder="수량을 입력하세요"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* 단가 */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            단가
                        </label>
                        <input
                            type="number"
                            value={unitPrice}
                            onChange={(e) => setUnitPrice(e.target.value ? parseInt(e.target.value) : '')}
                            placeholder="단가를 입력하세요"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* 금액 */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            금액
                        </label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value ? parseInt(e.target.value) : '')}
                            placeholder="금액을 입력하세요 (자동계산됨)"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50"
                        />
                    </div>

                    {/* 메모 */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            메모
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="추가 정보를 입력하세요"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* 버튼 */}
                    <div className="flex justify-end space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                        >
                            취소
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors"
                        >
                            {initialData ? '수정' : '추가'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicalRecordItemModal;