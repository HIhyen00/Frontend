import React, { useState, useEffect } from 'react';
import {
    vaccinationRecordApi,
    formatVaccinationDate,
    formatDoseOrder,
    validateVaccinationRecord,
    getTodayDate,
    type VaccineWithRecordDto,
    type RegisterVacRecordRequest,
    type UpdateVacRecordRequest,
    type MedicalRecordPageProps,
} from '../utils/vaccinationHistoryApi.ts';

const VaccinationHistory: React.FC<MedicalRecordPageProps> = ({ pet, onUpdatePet }) => {
    const petId = pet.id;

    // API 응답 데이터
    const [vaccineData, setVaccineData] = useState<VaccineWithRecordDto[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    // UI 상태
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});
    const [expandedOther, setExpandedOther] = useState<boolean>(false);
    const [showDropdown, setShowDropdown] = useState<number | null>(null);

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [modalType, setModalType] = useState<'vaccine' | 'other'>('vaccine');
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [selectedVaccineId, setSelectedVaccineId] = useState<number | null>(null);
    const [selectedVaccineName, setSelectedVaccineName] = useState<string>('');
    const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);
    const [formData, setFormData] = useState({
        customVaccineName: '',
        vaccinationDate: '',
        hospitalName: ''
    });

    // 데이터 로드
    useEffect(() => {
        fetchVaccinationRecords();
    }, [petId]);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showDropdown !== null) {
                const dropdown = document.getElementById(`dropdown-${showDropdown}`);
                const button = document.getElementById(`button-${showDropdown}`);

                if (dropdown && !dropdown.contains(event.target as Node) &&
                    button && !button.contains(event.target as Node)) {
                    setShowDropdown(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    // API: 백신 접종 기록 목록 조회
    const fetchVaccinationRecords = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await vaccinationRecordApi.getList(petId);
            setVaccineData(response.vacRecords);
        } catch (err) {
            console.error('접종 기록 조회 실패:', err);
            setError('접종 기록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (vaccineName: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [vaccineName]: !prev[vaccineName]
        }));
    };

    // 모달 열기 (추가)
    const openModal = (type: 'vaccine' | 'other', vaccineId?: number, vaccineName?: string) => {
        setModalType(type);
        setModalMode('add');
        setSelectedVaccineId(vaccineId || null);
        setSelectedVaccineName(vaccineName || '');
        setSelectedRecordId(null);
        setFormData({
            customVaccineName: '',
            vaccinationDate: getTodayDate(),
            hospitalName: ''
        });
        setIsModalOpen(true);
    };

    // 모달 열기 (수정)
    const openEditModal = async (recordId: number, type: 'vaccine' | 'other') => {
        try {
            setLoading(true);
            const record = await vaccinationRecordApi.getById(petId, recordId);

            setModalType(type);
            setModalMode('edit');
            setSelectedRecordId(recordId);
            setSelectedVaccineId(record.vaccineId || null);
            setSelectedVaccineName(record.vaccineName || '');
            setFormData({
                customVaccineName: record.customVaccineName || '',
                vaccinationDate: record.vaccinationDate,
                hospitalName: record.hospitalName
            });
            setIsModalOpen(true);
            setShowDropdown(null);
        } catch (err) {
            console.error('접종 기록 조회 실패:', err);
            alert('접종 기록을 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
        setModalMode('add');
        setSelectedVaccineId(null);
        setSelectedVaccineName('');
        setSelectedRecordId(null);
        setFormData({
            customVaccineName: '',
            vaccinationDate: '',
            hospitalName: ''
        });
    };

    // 백신 기록 추가/수정
    const handleSubmit = async () => {
        try {
            if (modalMode === 'edit' && selectedRecordId) {
                // 수정
                const updateData: UpdateVacRecordRequest = {
                    customVaccineName: modalType === 'other' ? formData.customVaccineName : null,
                    vaccinationDate: formData.vaccinationDate,
                    hospitalName: formData.hospitalName
                };

                validateVaccinationRecord(updateData);
                await vaccinationRecordApi.update(petId, selectedRecordId, updateData);
                alert('접종 기록이 수정되었습니다.');
            } else {
                // 추가
                const registerData: RegisterVacRecordRequest = {
                    vaccineId: modalType === 'vaccine' ? selectedVaccineId : null,
                    customVaccineName: modalType === 'other' ? formData.customVaccineName : null,
                    vaccinationDate: formData.vaccinationDate,
                    hospitalName: formData.hospitalName
                };

                validateVaccinationRecord(registerData);
                await vaccinationRecordApi.register(petId, registerData);
                alert('접종 기록이 추가되었습니다.');
            }

            closeModal();
            await fetchVaccinationRecords(); // 데이터 새로고침
        } catch (err: any) {
            console.error('백신 기록 처리 중 오류:', err);
            alert(err.message || '백신 기록 처리에 실패했습니다.');
        }
    };

    // 백신 기록 삭제
    const handleDelete = async (recordId: number) => {
        if (window.confirm('정말로 이 접종 기록을 삭제하시겠습니까?')) {
            try {
                await vaccinationRecordApi.delete(petId, recordId);
                alert('접종 기록이 삭제되었습니다.');
                setShowDropdown(null);
                await fetchVaccinationRecords(); // 데이터 새로고침
            } catch (err) {
                console.error('백신 기록 삭제 중 오류:', err);
                alert('백신 기록 삭제에 실패했습니다.');
            }
        }
    };

    // 로딩 중
    if (loading && vaccineData.length === 0) {
        return (
            <div className="max-w-4xl rounded-2xl mx-auto bg-white min-h-screen p-6 flex items-center justify-center">
                <div className="text-gray-500">로딩 중...</div>
            </div>
        );
    }

    // 에러 발생
    if (error) {
        return (
            <div className="max-w-4xl rounded-2xl mx-auto bg-white min-h-screen p-6 flex items-center justify-center">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    // 일반 백신 목록 (기타 제외)
    const regularVaccines = vaccineData.filter(v => v.vaccineId !== null);
    // 기타 백신
    const otherVaccine = vaccineData.find(v => v.vaccineId === null);

    return (
        <>
            <div className="max-w-4xl rounded-2xl mx-auto bg-white min-h-screen p-6">
                <div className="space-y-2">
                    {regularVaccines.map((vaccine) => {
                        const isExpanded = expandedSections[vaccine.vaccineName];
                        const records = vaccine.vaccinationRecords;

                        return (
                            <div key={vaccine.vaccineId} className="rounded-lg bg-gray-100">
                                <div className={`w-full flex items-center justify-between p-3 transition-colors rounded-t-lg ${
                                    isExpanded ? 'bg-purple-500' : 'bg-gray-50'
                                }`}>
                                    <button
                                        onClick={() => toggleSection(vaccine.vaccineName)}
                                        className="flex items-center flex-1"
                                    >
                                        <span className={`text-base font-medium mr-3 ${
                                            isExpanded ? 'text-white' : 'text-gray-600'
                                        }`}>{vaccine.vaccineName}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal('vaccine', vaccine.vaccineId!, vaccine.vaccineName);
                                            }}
                                            className={`w-8 h-8 flex items-center justify-center text-xs transition-colors ${
                                                isExpanded
                                                    ? 'text-white hover:text-gray-200'
                                                    : 'text-gray-300 hover:text-gray-600'
                                            }`}
                                        >
                                            <i className="fas fa-plus"></i>
                                        </button>
                                    </button>

                                    <div className="flex items-center">
                                        <button
                                            onClick={() => toggleSection(vaccine.vaccineName)}
                                            className="flex items-center"
                                        >
                                            <svg
                                                className={`w-5 h-5 transform transition-transform ${
                                                    isExpanded ? 'rotate-180 text-white' : 'text-gray-600'
                                                }`}
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                {isExpanded && (
                                    <div className="bg-gray-100 rounded-b-lg">
                                        {records.length > 0 ? (
                                            <div className="divide-y divide-gray-300">
                                                {records.map((record, index) => (
                                                    <div key={record.recordId} className="p-3 flex justify-between items-center relative">
                                                        <div>
                                                            <div className="font-normal text-sm">
                                                                {formatDoseOrder(records.length - index)}
                                                                <span className="text-gray-500 text-xs ml-1">{record.hospitalName}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="text-sm text-gray-800">
                                                                {formatVaccinationDate(record.vaccinationDate)}
                                                            </div>
                                                            <button
                                                                id={`button-${record.recordId}`}
                                                                onClick={() => setShowDropdown(showDropdown === record.recordId ? null : record.recordId)}
                                                                className="text-gray-400 hover:text-gray-600 p-1"
                                                            >
                                                                <i className="fas fa-ellipsis-vertical"></i>
                                                            </button>
                                                        </div>

                                                        {showDropdown === record.recordId && (
                                                            <div id={`dropdown-${record.recordId}`} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-4 bg-white rounded-md shadow-lg z-10 min-w-[80px]">
                                                                <button
                                                                    onClick={() => openEditModal(record.recordId, 'vaccine')}
                                                                    className="block w-full px-3 py-2 text-center text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    수정
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(record.recordId)}
                                                                    className="block w-full px-3 py-2 text-center text-sm text-red-600 hover:bg-gray-100"
                                                                >
                                                                    삭제
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="p-3 text-gray-500 text-sm text-center">
                                                접종 이력이 없습니다.
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* 기타 섹션 */}
                    <div className="rounded-lg bg-gray-100">
                        <div className={`w-full flex items-center justify-between p-3 transition-colors rounded-t-lg ${
                            expandedOther ? 'bg-gray-500' : 'bg-gray-50'
                        }`}>
                            <button
                                onClick={() => setExpandedOther(!expandedOther)}
                                className="flex items-center flex-1"
                            >
                                <span className={`font-medium text-base mr-3 ${
                                    expandedOther ? 'text-white' : 'text-gray-600'
                                }`}>기타</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        openModal('other');
                                    }}
                                    className={`w-8 h-8 flex items-center justify-center text-xs transition-colors ${
                                        expandedOther
                                            ? 'text-white hover:text-gray-200'
                                            : 'text-gray-300 hover:text-gray-600'
                                    }`}
                                >
                                    <i className="fas fa-plus"></i>
                                </button>
                            </button>

                            <div className="flex items-center">
                                <button
                                    onClick={() => setExpandedOther(!expandedOther)}
                                    className="flex items-center"
                                >
                                    <svg
                                        className={`w-5 h-5 transform transition-transform ${
                                            expandedOther ? 'rotate-180 text-white' : 'text-gray-600'
                                        }`}
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>
                            </div>
                        </div>

                        {expandedOther && (
                            <div className="bg-gray-100 rounded-b-lg">
                                {otherVaccine && otherVaccine.vaccinationRecords.length > 0 ? (
                                    <div className="divide-y divide-gray-300">
                                        {otherVaccine.vaccinationRecords.map((record) => (
                                            <div key={record.recordId} className="p-3 flex justify-between items-center relative">
                                                <div>
                                                    <div className="text-sm">
                                                        {record.customVaccineName}
                                                        <span className="text-xs text-gray-500 ml-3">
                                                            {record.hospitalName}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center space-x-3">
                                                    <div className="text-sm text-gray-800">
                                                        {formatVaccinationDate(record.vaccinationDate)}
                                                    </div>
                                                    <button
                                                        id={`button-${record.recordId}`}
                                                        onClick={() => setShowDropdown(showDropdown === record.recordId ? null : record.recordId)}
                                                        className="text-gray-400 hover:text-gray-600 p-1"
                                                    >
                                                        <i className="fas fa-ellipsis-vertical"></i>
                                                    </button>
                                                </div>

                                                {showDropdown === record.recordId && (
                                                    <div id={`dropdown-${record.recordId}`} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-4 bg-white rounded-md shadow-lg z-10 min-w-[80px]">
                                                        <button
                                                            onClick={() => openEditModal(record.recordId, 'other')}
                                                            className="block w-full px-3 py-2 text-center text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(record.recordId)}
                                                            className="block w-full px-3 py-2 text-center text-sm text-red-600 hover:bg-gray-100"
                                                        >
                                                            삭제
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-3 text-gray-500 text-sm text-center">
                                        접종 이력이 없습니다.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* 모달 */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50"
                        onClick={() => {
                            closeModal();
                            setShowDropdown(null);
                        }}
                    ></div>

                    <div className="relative bg-white rounded-lg p-6 w-full max-w-md mx-4 z-10">
                        <div className="mb-4">
                            <h2 className="text-lg font-semibold text-gray-800 mb-2">
                                {modalMode === 'edit'
                                    ? '접종 기록 수정'
                                    : `${modalType === 'vaccine' ? selectedVaccineName : '기타 백신'} 기록 추가`}
                            </h2>
                        </div>

                        <div>
                            {modalType === 'other' && (
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        백신 이름
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.customVaccineName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, customVaccineName: e.target.value }))}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        placeholder="백신 이름을 입력하세요"
                                    />
                                </div>
                            )}

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    병원 이름
                                </label>
                                <input
                                    type="text"
                                    value={formData.hospitalName}
                                    onChange={(e) => setFormData(prev => ({ ...prev, hospitalName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="병원 이름을 입력하세요"
                                />
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    접종 날짜
                                </label>
                                <input
                                    type="date"
                                    value={formData.vaccinationDate}
                                    onChange={(e) => setFormData(prev => ({ ...prev, vaccinationDate: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    max={getTodayDate()}
                                />
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                                >
                                    취소
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? '처리 중...' : (modalMode === 'edit' ? '수정' : '추가')}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default VaccinationHistory;