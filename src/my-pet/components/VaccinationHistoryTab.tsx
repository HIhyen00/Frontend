import React, { useState, useEffect } from 'react';

const VaccinationHistory = () => {
    const [pet, setPet] = useState({
        id: 1,
        name: 'A',
        species: 'DOG' // DOG, CAT, OTHER
    });

    const [vaccinesBySpecies] = useState({
        DOG: ['종합백신', '광견병', '코로나', '켄넬코프', '신종플루', '심장사상충'],
        CAT: ['혼합백신', '백혈병', '광견병', '심장사상충'],
        OTHER: []
    });

    const [vaccinationRecords, setVaccinationRecords] = useState([
        {
            id: 1,
            petId: 1,
            vaccineId: 1,
            customVaccineName: null,
            vaccinationDate: '2025-08-25',
            hospitalName: 'D병원'
        },
        {
            id: 2,
            petId: 1,
            vaccineId: 1,
            customVaccineName: null,
            vaccinationDate: '2024-08-25',
            hospitalName: 'D병원'
        },
        {
            id: 3,
            petId: 1,
            vaccineId: 2,
            customVaccineName: null,
            vaccinationDate: '2023-08-23',
            hospitalName: 'A병원'
        },
        {
            id: 4,
            petId: 1,
            vaccineId: null,
            customVaccineName: '특수백신A',
            vaccinationDate: '2024-05-10',
            hospitalName: 'B병원'
        }
    ]);

    const [vaccines] = useState([
        { vaccineId: 1, vaccineName: '종합백신', species: 'DOG' },
        { vaccineId: 2, vaccineName: '광견병', species: 'DOG' },
        { vaccineId: 3, vaccineName: '코로나', species: 'DOG' },
        { vaccineId: 4, vaccineName: '켄넬코프', species: 'DOG' },
        { vaccineId: 5, vaccineName: '신종플루', species: 'DOG' },
        { vaccineId: 6, vaccineName: '심장사상충', species: 'DOG' }
    ]);

    const [expandedSections, setExpandedSections] = useState({});
    const [expandedOther, setExpandedOther] = useState(false);

    // 모달 관련 상태
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('vaccine'); // 'vaccine' or 'other'
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedVaccine, setSelectedVaccine] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [formData, setFormData] = useState({
        vaccineName: '',
        vaccinationDate: '',
        hospitalName: ''
    });
    const [showDropdown, setShowDropdown] = useState(null);

    // 외부 클릭 감지
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showDropdown !== null) {
                const dropdown = document.getElementById(`dropdown-${showDropdown}`);
                const button = document.getElementById(`button-${showDropdown}`);

                if (dropdown && !dropdown.contains(event.target) &&
                    button && !button.contains(event.target)) {
                    setShowDropdown(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const toggleSection = (vaccineName) => {
        setExpandedSections(prev => ({
            ...prev,
            [vaccineName]: !prev[vaccineName]
        }));
    };

    const getVaccineRecords = (vaccineName) => {
        const vaccine = vaccines.find(v => v.vaccineName === vaccineName);
        if (!vaccine) return [];

        return vaccinationRecords
            .filter(record => record.vaccineId === vaccine.vaccineId)
            .sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate));
    };

    const getOtherRecords = () => {
        return vaccinationRecords
            .filter(record => !record.vaccineId)
            .sort((a, b) => new Date(b.vaccinationDate) - new Date(a.vaccinationDate));
    };

    const formatDate = (dateString) => {
        return dateString.replace(/-/g, '-');
    };

    const formatDoseOrder = (order) => {
        return `${order}차`;
    };

    // 모달 열기 (추가)
    const openModal = (type, vaccineName = null) => {
        setModalType(type);
        setModalMode('add');
        setSelectedVaccine(vaccineName);
        setSelectedRecord(null);
        setFormData({
            vaccineName: type === 'other' ? '' : vaccineName,
            vaccinationDate: '',
            hospitalName: ''
        });
        setIsModalOpen(true);
    };

    // 모달 열기 (수정)
    const openEditModal = (record, type) => {
        setModalType(type);
        setModalMode('edit');
        setSelectedRecord(record);
        setSelectedVaccine(type === 'vaccine' ? vaccines.find(v => v.vaccineId === record.vaccineId)?.vaccineName : null);
        setFormData({
            vaccineName: type === 'other' ? record.customVaccineName : vaccines.find(v => v.vaccineId === record.vaccineId)?.vaccineName || '',
            vaccinationDate: record.vaccinationDate,
            hospitalName: record.hospitalName
        });
        setIsModalOpen(true);
        setShowDropdown(null);
    };

    // 모달 닫기
    const closeModal = () => {
        setIsModalOpen(false);
        setModalMode('add');
        setSelectedVaccine(null);
        setSelectedRecord(null);
        setFormData({
            vaccineName: '',
            vaccinationDate: '',
            hospitalName: ''
        });
    };

    // 백신 기록 추가/수정
    const handleSubmit = () => {
        if (!formData.vaccinationDate) {
            alert('접종 날짜를 입력해주세요.');
            return;
        }

        if (!formData.hospitalName) {
            alert('병원 이름을 입력해주세요.');
            return;
        }

        if (modalType === 'other' && !formData.vaccineName) {
            alert('백신 이름을 입력해주세요.');
            return;
        }

        try {
            if (modalMode === 'edit') {
                // 수정 모드
                const updatedRecords = vaccinationRecords.map(record => {
                    if (record.id === selectedRecord.id) {
                        if (modalType === 'vaccine') {
                            return {
                                ...record,
                                vaccinationDate: formData.vaccinationDate,
                                hospitalName: formData.hospitalName
                            };
                        } else {
                            return {
                                ...record,
                                customVaccineName: formData.vaccineName,
                                vaccinationDate: formData.vaccinationDate,
                                hospitalName: formData.hospitalName
                            };
                        }
                    }
                    return record;
                });

                // 백엔드로 전송할 데이터
                const backendData = modalType === 'vaccine'
                    ? {
                        recordId: selectedRecord.id,
                        vaccinationDate: formData.vaccinationDate,
                        hospitalName: formData.hospitalName
                    }
                    : {
                        recordId: selectedRecord.id,
                        customVaccineName: formData.vaccineName,
                        vaccinationDate: formData.vaccinationDate,
                        hospitalName: formData.hospitalName
                    };

                console.log('백엔드로 전송할 데이터 (수정):', backendData);

                setVaccinationRecords(updatedRecords);
            } else {
                // 추가 모드
                if (modalType === 'vaccine') {
                    const vaccine = vaccines.find(v => v.vaccineName === selectedVaccine);

                    const newRecord = {
                        id: Date.now(),
                        petId: pet.id,
                        vaccineId: vaccine.vaccineId,
                        customVaccineName: null,
                        vaccinationDate: formData.vaccinationDate,
                        hospitalName: formData.hospitalName
                    };

                    const backendData = {
                        petId: pet.id,
                        vaccineId: vaccine.vaccineId,
                        vaccinationDate: formData.vaccinationDate,
                        hospitalName: formData.hospitalName
                    };

                    console.log('백엔드로 전송할 데이터 (일반 백신 추가):', backendData);

                    setVaccinationRecords(prev => [...prev, newRecord]);
                } else {
                    const newRecord = {
                        id: Date.now(),
                        petId: pet.id,
                        vaccineId: null,
                        customVaccineName: formData.vaccineName,
                        vaccinationDate: formData.vaccinationDate,
                        hospitalName: formData.hospitalName
                    };

                    const backendData = {
                        petId: pet.id,
                        customVaccineName: formData.vaccineName,
                        vaccinationDate: formData.vaccinationDate,
                        hospitalName: formData.hospitalName
                    };

                    console.log('백엔드로 전송할 데이터 (기타 백신 추가):', backendData);

                    setVaccinationRecords(prev => [...prev, newRecord]);
                }
            }

            closeModal();
        } catch (error) {
            console.error('백신 기록 처리 중 오류:', error);
            alert('백신 기록 처리에 실패했습니다.');
        }
    };

    // 백신 기록 삭제
    const handleDelete = (record) => {
        if (window.confirm('정말로 이 접종 기록을 삭제하시겠습니까?')) {
            try {
                const updatedRecords = vaccinationRecords.filter(r => r.id !== record.id);

                const backendData = { recordId: record.id };
                console.log('백엔드로 전송할 데이터 (삭제):', backendData);

                setVaccinationRecords(updatedRecords);
                setShowDropdown(null);
            } catch (error) {
                console.error('백신 기록 삭제 중 오류:', error);
                alert('백신 기록 삭제에 실패했습니다.');
            }
        }
    };

    const availableVaccines = vaccinesBySpecies[pet.species] || [];
    const otherRecords = getOtherRecords();

    return (
        <>
            <div className="max-w-4xl rounded-2xl mx-auto bg-white min-h-screen p-6">
                <div className="space-y-2">
                    {availableVaccines.map((vaccineName) => {
                        const records = getVaccineRecords(vaccineName);
                        const isExpanded = expandedSections[vaccineName];

                        return (
                            <div key={vaccineName} className="rounded-lg bg-gray-100">
                                <div className={`w-full flex items-center justify-between p-3 transition-colors rounded-t-lg ${
                                    isExpanded ? 'bg-purple-500' : 'bg-gray-50'
                                }`}>
                                    <button
                                        onClick={() => toggleSection(vaccineName)}
                                        className="flex items-center flex-1"
                                    >
                                        <span className={`text-base font-medium mr-3 ${
                                            isExpanded ? 'text-white' : 'text-gray-600'
                                        }`}>{vaccineName}</span>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                openModal('vaccine', vaccineName);
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
                                            onClick={() => toggleSection(vaccineName)}
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
                                                    <div key={record.id} className="p-3 flex justify-between items-center relative">
                                                        <div>
                                                            <div className="font-normal text-sm">
                                                                {formatDoseOrder(records.length - index)} <span className="text-gray-500 text-xs ml-1">{record.hospitalName}</span>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center space-x-3">
                                                            <div className="text-sm text-gray-800">
                                                                {formatDate(record.vaccinationDate)}
                                                            </div>
                                                            <button
                                                                id={`button-${record.id}`}
                                                                onClick={() => setShowDropdown(showDropdown === record.id ? null : record.id)}
                                                                className="text-gray-400 hover:text-gray-600 p-1"
                                                            >
                                                                <i className="fas fa-ellipsis-vertical"></i>
                                                            </button>
                                                        </div>

                                                        {showDropdown === record.id && (
                                                            <div id={`dropdown-${record.id}`} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-4 bg-white rounded-md shadow-lg z-10 min-w-[80px]">
                                                                <button
                                                                    onClick={() => openEditModal(record, 'vaccine')}
                                                                    className="block w-full px-3 py-2 text-center text-sm text-gray-700 hover:bg-gray-100"
                                                                >
                                                                    수정
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDelete(record)}
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
                                {otherRecords.length > 0 ? (
                                    <div className="divide-y divide-gray-300">
                                        {otherRecords.map((record) => (
                                            <div key={record.id} className="p-3 flex justify-between items-center relative">
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
                                                        {formatDate(record.vaccinationDate)}
                                                    </div>
                                                    <button
                                                        id={`button-${record.id}`}
                                                        onClick={() => setShowDropdown(showDropdown === record.id ? null : record.id)}
                                                        className="text-gray-400 hover:text-gray-600 p-1"
                                                    >
                                                        <i className="fas fa-ellipsis-vertical"></i>
                                                    </button>
                                                </div>

                                                {showDropdown === record.id && (
                                                    <div id={`dropdown-${record.id}`} className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full ml-4 bg-white rounded-md shadow-lg z-10 min-w-[80px]">
                                                        <button
                                                            onClick={() => openEditModal(record, 'other')}
                                                            className="block w-full px-3 py-2 text-center text-sm text-gray-700 hover:bg-gray-100"
                                                        >
                                                            수정
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(record)}
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

                    {availableVaccines.every(vaccine => getVaccineRecords(vaccine).length === 0) && otherRecords.length === 0 && (
                        <div className="text-center text-sm py-8 text-gray-500">
                            아직 접종 이력이 없습니다.
                        </div>
                    )}
                </div>
            </div>

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
                                {modalMode === 'edit' ? '접종 기록 수정' : `${modalType === 'vaccine' ? selectedVaccine : '기타 백신'} 기록 추가`}
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
                                        value={formData.vaccineName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, vaccineName: e.target.value }))}
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
                                    className="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors"
                                >
                                    {modalMode === 'edit' ? '수정' : '추가'}
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