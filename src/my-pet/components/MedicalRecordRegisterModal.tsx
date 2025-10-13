import React, { useState, useEffect, useRef } from 'react';
import {
    medicalRecordApi,
    getTodayDate,
    type ReadMedicalRecordResponse,
    type RegisterMedicalRecordRequest,
    type UpdateMedicalRecordRequest,
    type FileInfoDto,
    type TestItemDto,
    type TreatmentItemDto,
    type MedicationItemDto,
} from '../utils/medicalRecordApi';
import MedicalRecordItemModal from './MedicalRecordItemModal';
import ConfirmModal from "./ConfirmModel.tsx";

interface MedicalRecordRegisterModalProps {
    petId: number;
    mode: 'add' | 'edit';
    recordId: number | null;
    initialData: ReadMedicalRecordResponse | null;
    onClose: () => void;
    onSuccess: () => void;
    showAlert: (message: string) => void;
}

type ItemType = 'test' | 'treatment' | 'medication';

const MedicalRecordRegisterModal: React.FC<MedicalRecordRegisterModalProps> = ({
                                                                                   petId,
                                                                                   mode,
                                                                                   recordId,
                                                                                   initialData,
                                                                                   onClose,
                                                                                   onSuccess,
                                                                                   showAlert,
                                                                               }) => {
    const [loading, setLoading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);

    // 기본 정보
    const [visitDate, setVisitDate] = useState(getTodayDate());
    const [hospitalName, setHospitalName] = useState('');
    const [hospitalNumber, setHospitalNumber] = useState('');
    const [hospitalAddress, setHospitalAddress] = useState('');

    // 진단/증상
    const [diagnosis, setDiagnosis] = useState('');
    const [symptoms, setSymptoms] = useState('');

    // 항목들
    const [testItems, setTestItems] = useState<TestItemDto[]>([]);
    const [treatmentItems, setTreatmentItems] = useState<TreatmentItemDto[]>([]);
    const [medicationItems, setMedicationItems] = useState<MedicationItemDto[]>([]);

    // 금액
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [vatAmount, setVatAmount] = useState<number>(0);

    // 파일
    const [receiptFileId, setReceiptFileId] = useState<number | null>(null);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [receiptFileName, setReceiptFileName] = useState<string>('');
    const [receiptFileInfo, setReceiptFileInfo] = useState<FileInfoDto | null>(null);

    const [attachmentFileIds, setAttachmentFileIds] = useState<number[]>([]);
    const [attachmentFiles, setAttachmentFiles] = useState<Array<{file: File, name: string, id?: number}>>([]);
    const [attachmentFileInfos, setAttachmentFileInfos] = useState<FileInfoDto[]>([]);

    // 파일 input refs
    const receiptInputRef = useRef<HTMLInputElement>(null);
    const attachmentInputRef = useRef<HTMLInputElement>(null);

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<{ type: ItemType; index: number } | null>(null);

    // 항목 추가 모달
    const [isItemModalOpen, setIsItemModalOpen] = useState(false);
    const [currentItemType, setCurrentItemType] = useState<ItemType>('test');
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    // 수정 모드일 때 초기 데이터 로드
    useEffect(() => {
        if (mode === 'edit' && initialData) {
            setVisitDate(initialData.visitDate);
            setHospitalName(initialData.hospitalName || '');
            setHospitalNumber(initialData.hospitalNumber || '');
            setHospitalAddress(initialData.hospitalAddress || '');
            setDiagnosis(initialData.diagnosis || '');
            setSymptoms(initialData.symptoms || '');
            setTestItems(initialData.testItems || []);
            setTreatmentItems(initialData.treatmentItems || []);
            setMedicationItems(initialData.medicationItems || []);
            setTotalAmount(initialData.totalAmount || 0);
            setVatAmount(initialData.vatAmount || 0);

            if (initialData.receiptFile) {
                setReceiptFileId(initialData.receiptFile.fileId);
                setReceiptFileName(initialData.receiptFile.fileName);
                setReceiptFileInfo(initialData.receiptFile);
            }

            if (initialData.attachmentFiles) {
                setAttachmentFileIds(initialData.attachmentFiles.map(f => f.fileId));
                setAttachmentFileInfos(initialData.attachmentFiles);
                setAttachmentFiles(initialData.attachmentFiles.map(f => ({
                    file: new File([], f.fileName),
                    name: f.fileName,
                    id: f.fileId
                })));
            }
        }
    }, [mode, initialData]);

    // 총 금액 자동 계산
    useEffect(() => {
        const testTotal = testItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const treatmentTotal = treatmentItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const medicationTotal = medicationItems.reduce((sum, item) => sum + (item.amount || 0), 0);
        const calculated = testTotal + treatmentTotal + medicationTotal;

        if (calculated > 0) {
            setTotalAmount(calculated);
        }
    }, [testItems, treatmentItems, medicationItems]);

    // 청구서 파일 선택
    const handleReceiptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setReceiptFile(file);
            setReceiptFileName(file.name);

            // 파일 업로드
            try {
                const uploadResponse = await medicalRecordApi.uploadFile(
                    file,
                    'MEDICAL_RECEIPT',
                    'MedicalRecord',
                    mode === 'edit' ? recordId || undefined : undefined
                );
                setReceiptFileId(uploadResponse.fileId);

                setReceiptFileInfo({
                    fileId: uploadResponse.fileId,
                    fileName: uploadResponse.originalFileName,
                    fileUrl: uploadResponse.fileUrl,
                    fileSize: uploadResponse.fileSize,
                    contentType: uploadResponse.contentType
                });
            } catch (error) {
                console.error('청구서 업로드 실패:', error);
                showAlert('청구서 업로드에 실패했습니다.');
                setReceiptFile(null);
                setReceiptFileName('');
            }
        }
    };

    // 청구서 파일 삭제
    const handleDeleteReceiptFile = async () => {
        if (receiptFileId) {
            try {
                await medicalRecordApi.deleteFile(receiptFileId);
            } catch (error) {
                console.error('청구서 삭제 실패:', error);
            }
        }
        setReceiptFile(null);
        setReceiptFileName('');
        setReceiptFileId(null);
        setReceiptFileInfo(null);
        if (receiptInputRef.current) {
            receiptInputRef.current.value = '';
        }
    };

    // GPT 자동 분석
    const handleAutoAnalyze = async () => {
        if (!receiptFile) {
            showAlert('청구서 파일을 먼저 업로드해주세요.');
            return;
        }

        // 항목이 하나라도 있으면 경고
        if (testItems.length > 0 || treatmentItems.length > 0 || medicationItems.length > 0) {
            showAlert('자동 분석은 항목이 비어있을 때만 가능합니다. 기존 항목을 먼저 삭제해주세요.');
            return;
        }

        try {
            setAnalyzing(true);
            const analysisResult = await medicalRecordApi.analyzeReceipt(petId, receiptFile);

            // 분석 결과 적용
            if (analysisResult.hospitalName) setHospitalName(analysisResult.hospitalName);
            if (analysisResult.hospitalNumber) setHospitalNumber(analysisResult.hospitalNumber);
            if (analysisResult.hospitalAddress) setHospitalAddress(analysisResult.hospitalAddress);
            if (analysisResult.visitDate) setVisitDate(analysisResult.visitDate);
            if (analysisResult.totalAmount) setTotalAmount(analysisResult.totalAmount);
            if (analysisResult.vatAmount) setVatAmount(analysisResult.vatAmount);

            if (analysisResult.testItems) setTestItems(analysisResult.testItems);
            if (analysisResult.treatmentItems) setTreatmentItems(analysisResult.treatmentItems);
            if (analysisResult.medicationItems) setMedicationItems(analysisResult.medicationItems);

            showAlert('청구서 분석이 완료되었습니다! 내용을 확인하고 수정해주세요.');
        } catch (error: any) {
            console.error('GPT 분석 실패:', error);
            showAlert(error.message || '청구서 분석에 실패했습니다.');
        } finally {
            setAnalyzing(false);
        }
    };

    // 첨부파일 추가
    const handleAttachmentFilesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);

            for (const file of newFiles) {
                try {
                    const uploadResponse = await medicalRecordApi.uploadFile(
                        file,
                        'MEDICAL_DOCUMENT',
                        'MedicalRecord',
                        mode === 'edit' ? recordId || undefined : undefined
                    );

                    setAttachmentFiles(prev => [...prev, { file, name: file.name, id: uploadResponse.fileId }]);
                    setAttachmentFileIds(prev => [...prev, uploadResponse.fileId]);
                    setAttachmentFileInfos(prev => [...prev, {
                        fileId: uploadResponse.fileId,
                        fileName: uploadResponse.originalFileName,
                        fileUrl: uploadResponse.fileUrl,
                        fileSize: uploadResponse.fileSize,
                        contentType: uploadResponse.contentType
                    }]);
                } catch (error) {
                    console.error('첨부파일 업로드 실패:', error);
                    showAlert(`${file.name} 업로드에 실패했습니다.`);
                }
            }
        }
    };

    // 첨부파일 삭제
    const handleDeleteAttachment = async (index: number) => {
        const attachment = attachmentFiles[index];
        if (attachment.id) {
            try {
                await medicalRecordApi.deleteFile(attachment.id);
            } catch (error) {
                console.error('첨부파일 삭제 실패:', error);
            }
        }

        setAttachmentFiles(prev => prev.filter((_, i) => i !== index));
        setAttachmentFileIds(prev => prev.filter((_, i) => i !== index));
        setAttachmentFileInfos(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (!hospitalName.trim()) {
            showAlert('병원 이름을 입력해주세요.');
            return;
        }

        try {
            setLoading(true);

            if (mode === 'edit' && recordId) {
                const updateData: UpdateMedicalRecordRequest = {
                    visitDate,
                    hospitalName,
                    hospitalNumber: hospitalNumber || undefined,
                    hospitalAddress: hospitalAddress || undefined,
                    diagnosis: diagnosis || undefined,
                    symptoms: symptoms || undefined,
                    testItems: testItems.length > 0 ? testItems : undefined,
                    treatmentItems: treatmentItems.length > 0 ? treatmentItems : undefined,
                    medicationItems: medicationItems.length > 0 ? medicationItems : undefined,
                    totalAmount: totalAmount > 0 ? totalAmount : undefined,
                    vatAmount: vatAmount > 0 ? vatAmount : undefined,
                    receiptFileId: receiptFileId || undefined,
                    attachmentFileIds: attachmentFileIds.length > 0 ? attachmentFileIds : undefined,
                };

                await medicalRecordApi.update(petId, recordId, updateData);
                showAlert('진료기록이 수정되었습니다.');
            } else {
                const registerData: RegisterMedicalRecordRequest = {
                    visitDate,
                    hospitalName,
                    hospitalNumber: hospitalNumber || undefined,
                    hospitalAddress: hospitalAddress || undefined,
                    diagnosis: diagnosis || undefined,
                    symptoms: symptoms || undefined,
                    testItems: testItems.length > 0 ? testItems : undefined,
                    treatmentItems: treatmentItems.length > 0 ? treatmentItems : undefined,
                    medicationItems: medicationItems.length > 0 ? medicationItems : undefined,
                    totalAmount: totalAmount > 0 ? totalAmount : undefined,
                    vatAmount: vatAmount > 0 ? vatAmount : undefined,
                    receiptFileId: receiptFileId || undefined,
                    attachmentFileIds: attachmentFileIds.length > 0 ? attachmentFileIds : undefined,
                };

                await medicalRecordApi.register(petId, registerData);
                showAlert('진료기록이 등록되었습니다.');
            }

            onSuccess();
        } catch (err: any) {
            console.error('진료기록 처리 중 오류:', err);
            showAlert('진료기록 처리에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    const openItemModal = (type: ItemType, index?: number) => {
        setCurrentItemType(type);
        setEditingItemIndex(index !== undefined ? index : null);
        setIsItemModalOpen(true);
    };

    const handleItemSave = (itemData: TestItemDto | TreatmentItemDto | MedicationItemDto) => {
        const items =
            currentItemType === 'test' ? testItems :
                currentItemType === 'treatment' ? treatmentItems :
                    medicationItems;

        if (editingItemIndex !== null) {
            const newItems = [...items];
            newItems[editingItemIndex] = itemData;

            if (currentItemType === 'test') setTestItems(newItems as TestItemDto[]);
            else if (currentItemType === 'treatment') setTreatmentItems(newItems as TreatmentItemDto[]);
            else setMedicationItems(newItems as MedicationItemDto[]);
        } else {
            if (currentItemType === 'test') setTestItems([...testItems, itemData as TestItemDto]);
            else if (currentItemType === 'treatment') setTreatmentItems([...treatmentItems, itemData as TreatmentItemDto]);
            else setMedicationItems([...medicationItems, itemData as MedicationItemDto]);
        }

        setIsItemModalOpen(false);
        setEditingItemIndex(null);
    };

    const handleOpenConfirm = (type: ItemType, index: number) => {
        setItemToDelete({type, index});
        setIsConfirmOpen(true);
    }

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            const {type, index} = itemToDelete;
            if (type === 'test') {
                setTestItems(testItems.filter((_, i) => i !== index));
            } else if (type === 'treatment') {
                setTreatmentItems(treatmentItems.filter((_, i) => i !== index));
            } else {
                setMedicationItems(medicationItems.filter((_, i) => i !== index));
            }
            setIsConfirmOpen(false);
            setItemToDelete(null);
        }
    };

    const renderItemList = (items: (TestItemDto | TreatmentItemDto | MedicationItemDto)[], type: ItemType, title: string) => (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">{title}</label>
                <button
                    type="button"
                    onClick={() => openItemModal(type)}
                    className="text-sm text-indigo-600 hover:text-indigo-800"
                >
                    + 추가
                </button>
            </div>
            {items.length === 0 ? (
                <div className="text-sm text-gray-400 text-center py-2">항목이 없습니다</div>
            ) : (
                <div className="space-y-2">
                    {items.map((item, index) => (
                        <div key={index} className="flex justify-between items-start border rounded p-2 text-sm">
                            <div className="flex-1">
                                <p className="font-medium">{item.name}</p>
                                {item.notes && <p className="text-gray-500 text-xs mt-1">{item.notes}</p>}
                                {item.quantity && item.unitPrice && (
                                    <p className="text-gray-500 text-xs mt-1">
                                        {item.quantity} × {item.unitPrice.toLocaleString()}원
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center gap-2 ml-2">
                                {item.amount && (
                                    <span className="font-medium">{item.amount.toLocaleString()}원</span>
                                )}
                                <button
                                    type="button"
                                    onClick={() => openItemModal(type, index)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <i className="fas fa-edit"></i>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handleOpenConfirm(type, index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <i className="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    // 자동 분석 버튼 활성화 조건
    const canAutoAnalyze = receiptFileId && testItems.length === 0 && treatmentItems.length === 0 && medicationItems.length === 0;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                <div
                    className="fixed inset-0"
                    onClick={onClose}
                ></div>

                <div className="bg-white rounded-2xl p-4 w-full max-w-2xl shadow-xl relative z-10 my-8">
                    <div className="p-2 max-h-[80vh] overflow-y-auto">
                        {/* 헤더 */}
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-semibold text-gray-800">
                                {mode === 'edit' ? '진료기록 수정' : '진료기록 등록'}
                            </h2>
                            <button
                                onClick={onClose}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <i className="fas fa-times text-xl"></i>
                            </button>
                        </div>

                        {/* 청구서 업로드 영역 (맨 위!) */}
                        <div className="mb-6 p-4 bg-indigo-50 rounded-lg border-2 border-dashed border-indigo-300">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    청구서 업로드
                                </label>
                                {canAutoAnalyze && (
                                    <button
                                        type="button"
                                        onClick={handleAutoAnalyze}
                                        disabled={analyzing}
                                        className="px-3 py-1 bg-indigo-500 text-white text-sm rounded-md hover:bg-indigo-600 disabled:opacity-50"
                                    >
                                        {analyzing ? '분석 중...' : '🔁 GPT 자동 분석'}
                                    </button>
                                )}
                            </div>

                            {!receiptFileId && (
                                <p className="text-xs text-red-500 mb-2">
                                    ⚠️ 자동화를 원하면 청구서를 먼저 등록해주세요!
                                </p>
                            )}

                            {receiptFileName ? (
                                <div className="flex items-center justify-between p-2 bg-white rounded border">
                                    <div className="flex items-center gap-2">
                                        <i className="fas fa-file-image text-indigo-500"></i>
                                        <span className="text-sm">{receiptFileName}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleDeleteReceiptFile}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <i className="fas fa-trash"></i>
                                    </button>
                                </div>
                            ) : (
                                <button
                                    type="button"
                                    onClick={() => receiptInputRef.current?.click()}
                                    className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition"
                                >
                                    <i className="fas fa-upload text-gray-400 mr-2"></i>
                                    <span className="text-sm text-gray-600">청구서 이미지 선택</span>
                                </button>
                            )}
                            <input
                                ref={receiptInputRef}
                                type="file"
                                accept="image/*,.pdf"
                                onChange={handleReceiptFileChange}
                                className="hidden"
                            />
                        </div>

                        {/* 진료 날짜 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                진료 날짜 *
                            </label>
                            <input
                                type="date"
                                value={visitDate}
                                onChange={(e) => setVisitDate(e.target.value)}
                                max={getTodayDate()}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* 병원 이름 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                병원 이름 *
                            </label>
                            <input
                                type="text"
                                value={hospitalName}
                                onChange={(e) => setHospitalName(e.target.value)}
                                placeholder="병원 이름을 입력하세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* 병원 전화번호 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                병원 전화번호
                            </label>
                            <input
                                type="tel"
                                value={hospitalNumber}
                                onChange={(e) => setHospitalNumber(e.target.value)}
                                placeholder="전화번호를 입력하세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* 병원 주소 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                병원 주소
                            </label>
                            <input
                                type="text"
                                value={hospitalAddress}
                                onChange={(e) => setHospitalAddress(e.target.value)}
                                placeholder="주소를 입력하세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* 진단 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                진단
                            </label>
                            <textarea
                                value={diagnosis}
                                onChange={(e) => setDiagnosis(e.target.value)}
                                placeholder="진단 내용을 입력하세요"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* 증상 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                증상
                            </label>
                            <textarea
                                value={symptoms}
                                onChange={(e) => setSymptoms(e.target.value)}
                                placeholder="증상을 입력하세요"
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* 검사 항목 */}
                        {renderItemList(testItems, 'test', '검사 항목')}

                        {/* 처치 항목 */}
                        {renderItemList(treatmentItems, 'treatment', '처치 항목')}

                        {/* 처방 항목 */}
                        {renderItemList(medicationItems, 'medication', '처방 항목')}

                        {/* 총 금액 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                총 금액
                            </label>
                            <input
                                type="number"
                                value={totalAmount || ''}
                                onChange={(e) => setTotalAmount(parseInt(e.target.value) || 0)}
                                placeholder="총 금액을 입력하세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* 부가세 */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                부가세
                            </label>
                            <input
                                type="number"
                                value={vatAmount || ''}
                                onChange={(e) => setVatAmount(parseInt(e.target.value) || 0)}
                                placeholder="부가세를 입력하세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* 첨부파일 */}
                        <div className="mb-6">
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    첨부파일
                                </label>
                                <button
                                    type="button"
                                    onClick={() => attachmentInputRef.current?.click()}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    + 파일 추가
                                </button>
                            </div>
                            {attachmentFiles.length === 0 ? (
                                <div className="text-sm text-gray-400 text-center py-2">첨부된 파일이 없습니다</div>
                            ) : (
                                <div className="space-y-2">
                                    {attachmentFiles.map((attachment, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                                            <div className="flex items-center gap-2">
                                                <i className="fas fa-paperclip text-gray-500"></i>
                                                <span className="text-sm">{attachment.name}</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleDeleteAttachment(index)}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input
                                ref={attachmentInputRef}
                                type="file"
                                multiple
                                accept="image/*,.pdf"
                                onChange={handleAttachmentFilesChange}
                                className="hidden"
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
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-500 text-white rounded-md hover:bg-indigo-600 transition-colors disabled:opacity-50"
                            >
                                {loading ? '처리 중...' : (mode === 'edit' ? '수정' : '등록')}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* 항목 추가/수정 모달 */}
            {isItemModalOpen && (
                <MedicalRecordItemModal
                    type={currentItemType}
                    initialData={
                        editingItemIndex !== null
                            ? (currentItemType === 'test' ? testItems[editingItemIndex] :
                                currentItemType === 'treatment' ? treatmentItems[editingItemIndex] :
                                    medicationItems[editingItemIndex])
                            : undefined
                    }
                    onSave={handleItemSave}
                    onClose={() => {
                        setIsItemModalOpen(false);
                        setEditingItemIndex(null);
                    }}
                />
            )}

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="삭제 확인"
                message="정말로 이 항목을 삭제하시겠습니까?"
            />

        </>
    );
};

export default MedicalRecordRegisterModal;