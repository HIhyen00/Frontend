import React, { useState, useEffect } from 'react';
import {
    medicalRecordApi,
    formatMedicalDate,
    formatAmount,
    type ListMedicalRecordResponse,
    type ReadMedicalRecordResponse,
} from '../utils/medicalRecordApi';
import type { Pet } from '../../types/types';
import MedicalRecordRegisterModal from './MedicalRecordRegisterModal';

interface MedicalRecordTabProps {
    petData: Pet;
    onUpdate: (pet: Pet) => void;
}

const MedicalRecordTab: React.FC<MedicalRecordTabProps> = ({ petData, onUpdate }) => {
    const petId = petData.id;

    // 뷰 상태 (목록 or 상세보기)
    const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
    const [selectedRecordData, setSelectedRecordData] = useState<ReadMedicalRecordResponse | null>(null);

    // 데이터 상태
    const [records, setRecords] = useState<ListMedicalRecordResponse['medicalRecordList']>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // UI 상태
    const [hoveredRecordId, setHoveredRecordId] = useState<number | null>(null);
    const [showDropdown, setShowDropdown] = useState<number | null>(null);
    const [showDetailMenu, setShowDetailMenu] = useState<boolean>(false);

    // 모달 상태
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState<boolean>(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');

    const perPage = 10;

    useEffect(() => {
        if (currentView === 'list') {
            fetchMedicalRecords();
        }
    }, [currentPage, petId, currentView]);

    const fetchMedicalRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await medicalRecordApi.list(petId, currentPage, perPage);
            setRecords(response.medicalRecordList);
            setTotalPages(response.totalPages);
        } catch (err) {
            console.error('진료기록 목록 조회 실패:', err);
            setError('진료기록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const openRegisterModal = () => {
        setModalMode('add');
        setSelectedRecordId(null);
        setSelectedRecordData(null);
        setIsRegisterModalOpen(true);
    };

    const goToDetail = async (recordId: number) => {
        try {
            setLoading(true);
            const data = await medicalRecordApi.read(petId, recordId);
            setSelectedRecordId(recordId);
            setSelectedRecordData(data);
            setCurrentView('detail');
        } catch (err) {
            console.error('진료기록 조회 실패:', err);
            alert('진료기록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const backToList = () => {
        setCurrentView('list');
        setSelectedRecordId(null);
        setSelectedRecordData(null);
    };

    const openEditModalFromDetail = () => {
        console.log('openEditModalFromDetail 호출됨');
        console.log('selectedRecordData:', selectedRecordData);
        console.log('selectedRecordId:', selectedRecordId);

        if (!selectedRecordData || !selectedRecordId) {
            console.log('데이터가 없어서 리턴');
            return;
        }

        console.log('모달 열기 시도');
        setModalMode('edit');
        setIsRegisterModalOpen(true);
        console.log('isRegisterModalOpen을 true로 설정');
    };

    // 수정 모달 열기
    const openEditModal = async (recordId: number) => {
        try {
            setLoading(true);
            const data = await medicalRecordApi.read(petId, recordId);
            setModalMode('edit');
            setSelectedRecordId(recordId);
            setSelectedRecordData(data);
            setIsRegisterModalOpen(true);
        } catch (err) {
            console.error('진료기록 조회 실패:', err);
            alert('진료기록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 삭제 처리
    const handleDelete = async (recordId: number) => {
        if (!window.confirm('정말로 이 진료기록을 삭제하시겠습니까?')) {
            return;
        }

        try {
            setLoading(true);
            await medicalRecordApi.delete(petId, recordId);
            alert('진료기록이 삭제되었습니다.');
            backToList();
            await fetchMedicalRecords();
        } catch (err) {
            console.error('진료기록 삭제 실패:', err);
            alert('진료기록 삭제에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && records.length === 0 && currentView === 'list') {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    if (currentView === 'detail' && selectedRecordData) {
        const record = selectedRecordData;

        return (
            <>
                <div className="max-w-4xl rounded-2xl mx-auto bg-white min-h-screen p-6">
                    {/* 헤더 */}
                    <div className="flex justify-between items-center mb-6">
                        <button onClick={backToList} className="text-gray-500 hover:text-gray-800">
                            <i className="fas fa-arrow-left text-xl"></i>
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowDetailMenu(!showDetailMenu)}
                                className="p-2 hover:bg-gray-100 rounded-full"
                            >
                                <i className="fas fa-ellipsis-v text-gray-600"></i>
                            </button>

                            {showDetailMenu && (
                                <div className="absolute right-0 mt-2 w-32 bg-white rounded-lg shadow-lg border z-10">
                                    <button
                                        onClick={() => {
                                            console.log('수정 버튼 클릭!');
                                            console.log('selectedRecordId:', selectedRecordId);
                                            console.log('selectedRecordData:', selectedRecordData);
                                            console.log('record.id:', record.id);

                                            openEditModalFromDetail();
                                            setShowDetailMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                                    >
                                        수정
                                    </button>
                                    <button
                                        onClick={() => {
                                            handleDelete(record.id);
                                            setShowDetailMenu(false);
                                        }}
                                        className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm text-red-600"
                                    >
                                        삭제
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 병원 정보 */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-gray-800 mb-2">{record.hospitalName || '병원명 없음'}</h3>
                        {record.hospitalNumber && (
                            <p className="text-gray-600 text-sm">{record.hospitalNumber}</p>
                        )}
                        {record.hospitalAddress && (
                            <p className="text-gray-600 text-sm mt-1">{record.hospitalAddress}</p>
                        )}
                    </div>

                    {/* 진료 정보 */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm text-gray-500">진료일</p>
                                <p className="text-base font-medium text-gray-800">{formatMedicalDate(record.visitDate)}</p>
                            </div>
                            {record.totalAmount && (
                                <div>
                                    <p className="text-sm text-gray-500">총 금액</p>
                                    <p className="text-base font-medium text-indigo-600">{formatAmount(record.totalAmount)}</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 진단 */}
                    {record.diagnosis && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">진단</h4>
                            <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{record.diagnosis}</p>
                        </div>
                    )}

                    {/* 증상 */}
                    {record.symptoms && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">증상</h4>
                            <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg whitespace-pre-wrap">{record.symptoms}</p>
                        </div>
                    )}

                    {record.receiptFile && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">청구서</h4>
                            <div className="bg-gray-50  rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-file-invoice text-blue-500"></i>
                                        <span className="text-sm text-gray-700">{record.receiptFile.fileName}</span>
                                        <span className="text-xs text-gray-500">
                                        ({(record.receiptFile.fileSize / 1024).toFixed(1)}KB)
                                    </span>
                                    </div>
                                    <button
                                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                        onClick={() => window.open(record.receiptFile!.fileUrl, '_blank')}
                                    >
                                        보기
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 검사 항목 */}
                    {record.testItems && record.testItems.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">검사 항목</h4>
                            <div className="space-y-2">
                                {record.testItems.map((item, index) => (
                                    <div key={index} className="bg-purple-50  rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                {item.notes && (
                                                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                                                )}
                                                {item.quantity && item.unitPrice && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.quantity}개 × {formatAmount(item.unitPrice)}
                                                    </p>
                                                )}
                                            </div>
                                            {item.amount && (
                                                <p className="font-medium text-purple-600">{formatAmount(item.amount)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 처치 항목 */}
                    {record.treatmentItems && record.treatmentItems.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">처치 항목</h4>
                            <div className="space-y-2">
                                {record.treatmentItems.map((item, index) => (
                                    <div key={index} className="bg-purple-50  rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                {item.notes && (
                                                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                                                )}
                                                {item.quantity && item.unitPrice && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.quantity}개 × {formatAmount(item.unitPrice)}
                                                    </p>
                                                )}
                                            </div>
                                            {item.amount && (
                                                <p className="font-medium text-purple-600">{formatAmount(item.amount)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 처방 항목 */}
                    {record.medicationItems && record.medicationItems.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">처방 항목</h4>
                            <div className="space-y-2">
                                {record.medicationItems.map((item, index) => (
                                    <div key={index} className="bg-purple-50 rounded-lg p-3">
                                        <div className="flex justify-between items-start">
                                            <div className="flex-1">
                                                <p className="font-medium text-gray-800">{item.name}</p>
                                                {item.notes && (
                                                    <p className="text-sm text-gray-500 mt-1">{item.notes}</p>
                                                )}
                                                {item.quantity && item.unitPrice && (
                                                    <p className="text-xs text-gray-500 mt-1">
                                                        {item.quantity}개 × {formatAmount(item.unitPrice)}
                                                    </p>
                                                )}
                                            </div>
                                            {item.amount && (
                                                <p className="font-medium text-purple-600">{formatAmount(item.amount)}</p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* 금액 정보 */}
                    {(record.totalAmount || record.vatAmount) && (
                        <div className="bg-gray-50 rounded-lg p-4 mb-6">
                            <div className="space-y-2">
                                {record.totalAmount && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-700">총 금액</span>
                                        <span className="text-lg font-bold text-indigo-600">{formatAmount(record.totalAmount)}</span>
                                    </div>
                                )}
                                {record.vatAmount && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-400 text-sm">부가세</span>
                                        <span className="text-sm text-gray-600">{formatAmount(record.vatAmount)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {record.attachmentFiles && record.attachmentFiles.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-800 mb-3">첨부파일</h4>
                            <div className="space-y-2">
                                {record.attachmentFiles.map((file, index) => (
                                    <div key={file.fileId} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <i className="fas fa-paperclip text-gray-500"></i>
                                            <div>
                                                <span className="text-sm text-gray-700">{file.fileName}</span>
                                                <span className="text-xs text-gray-500 ml-2">
                                                ({(file.fileSize / 1024).toFixed(1)}KB)
                                            </span>
                                            </div>
                                        </div>
                                        <button
                                            className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                                            onClick={() => window.open(file.fileUrl, '_blank')}
                                        >
                                            다운로드
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                {isRegisterModalOpen && (
                    <MedicalRecordRegisterModal
                        petId={petId}
                        mode={modalMode}
                        recordId={selectedRecordId}
                        initialData={selectedRecordData}
                        onClose={() => setIsRegisterModalOpen(false)}
                        onSuccess={() => {
                            setIsRegisterModalOpen(false);
                            backToList();
                            fetchMedicalRecords();
                        }}
                    />
                )}
            </>
        );
    }

    return (
        <div className="max-w-4xl rounded-2xl mx-auto bg-white min-h-screen p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">진료기록</h2>
                <button
                    onClick={openRegisterModal}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition"
                >
                    <i className="fas fa-plus mr-2"></i>
                    등록
                </button>
            </div>

            <div className="flex-1">
                {records.length === 0 ? (
                    <div className="text-center py-20 text-gray-500">
                        등록된 진료기록이 없습니다.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {records.map((record) => (
                            <div
                                key={record.id}
                                onClick={() => goToDetail(record.id)}
                                className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer"
                            >
                                <div className="flex justify-between">
                                    <div>
                                        <p className="font-semibold">{record.hospitalName || '병원명 미등록'}</p>
                                        <p className="text-sm text-gray-500">{formatMedicalDate(record.visitDate)}</p>
                                        <p className="text-sm text-gray-600 mt-1">{record.diagnosis || '진단명 없음'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* 페이지네이션 - 2페이지 이상일 때만 표시 */}
            {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-6">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &lt;
                    </button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                        <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded ${
                                currentPage === page
                                    ? 'bg-indigo-500 text-white'
                                    : 'hover:bg-gray-100'
                            }`}
                        >
                            {page}
                        </button>
                    ))}

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        &gt;
                    </button>
                </div>
            )}

            {/* 이 부분을 추가! */}
            {isRegisterModalOpen && (
                <MedicalRecordRegisterModal
                    petId={petId}
                    mode={modalMode}
                    recordId={selectedRecordId}
                    initialData={selectedRecordData}
                    onClose={() => setIsRegisterModalOpen(false)}
                    onSuccess={() => {
                        setIsRegisterModalOpen(false);
                        backToList();
                        fetchMedicalRecords();
                    }}
                />
            )}
        </div>
    );
};

export default MedicalRecordTab;