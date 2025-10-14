import axiosInstance from './axiosConfig';

// ==================== 타입 정의 ====================

export interface FileInfoDto {
    fileId: number;
    fileName: string;
    fileUrl: string;
    fileSize: number;
    contentType: string;
}

export interface TestItemDto {
    id?: number;
    name: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    notes?: string;
}

export interface TreatmentItemDto {
    id?: number;
    name: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    notes?: string;
}

export interface MedicationItemDto {
    id?: number;
    name: string;
    quantity?: number;
    unitPrice?: number;
    amount?: number;
    notes?: string;
}

export interface RegisterMedicalRecordRequest {
    hospitalName?: string;
    hospitalNumber?: string;
    hospitalAddress?: string;
    visitDate: string;
    totalAmount?: number;
    vatAmount?: number;
    diagnosis?: string;
    symptoms?: string;
    receiptFileId?: number;
    attachmentFileIds?: number[];
    testItems?: TestItemDto[];
    treatmentItems?: TreatmentItemDto[];
    medicationItems?: MedicationItemDto[];
}

export interface UpdateMedicalRecordRequest extends RegisterMedicalRecordRequest {}

export interface ReadMedicalRecordResponse {
    id: number;
    petId: number;
    hospitalName?: string;
    hospitalNumber?: string;
    hospitalAddress?: string;
    visitDate: string;
    totalAmount?: number;
    vatAmount?: number;
    diagnosis?: string;
    symptoms?: string;
    receiptFile?: FileInfoDto;
    attachmentFiles?: FileInfoDto[];  
    testItems: TestItemDto[];
    treatmentItems: TreatmentItemDto[];
    medicationItems: MedicationItemDto[];
}


export interface ListMedicalRecordResponse {
    medicalRecordList: {
        id: number;
        hospitalName?: string;
        visitDate: string;
        diagnosis?: string;
    }[];
    currentPage: number;
    totalPages: number;
    totalItems: number;
}

export interface ReceiptAnalysisResponse {
    hospitalName?: string;
    hospitalNumber?: string;
    hospitalAddress?: string;
    visitDate?: string;
    totalAmount?: number;
    vatAmount?: number;
    testItems?: TestItemDto[];
    treatmentItems?: TreatmentItemDto[];
    medicationItems?: MedicationItemDto[];
    message?: string;
}

export interface FileUploadResponse {
    fileId: number;
    originalFileName: string;
    fileUrl: string;
    fileSize: number;
    contentType: string;
    message: string;
}

// ==================== API 서비스 ====================

export const medicalRecordApi = {
    // 진료기록 목록 조회
    list: async (
        petId: number,
        page: number = 1,
        perPage: number = 10
    ): Promise<ListMedicalRecordResponse> => {
        const response = await axiosInstance.get<ListMedicalRecordResponse>(
            `/pets/${petId}/medical-records`,
            { params: { page, perPage } }
        );
        return response.data;
    },

    // 진료기록 상세 조회
    read: async (
        petId: number,
        recordId: number
    ): Promise<ReadMedicalRecordResponse> => {
        const response = await axiosInstance.get<ReadMedicalRecordResponse>(
            `/pets/${petId}/medical-records/${recordId}`
        );
        return response.data;
    },

    // 진료기록 등록
    register: async (
        petId: number,
        data: RegisterMedicalRecordRequest
    ): Promise<string> => {
        const response = await axiosInstance.post<string>(
            `/pets/${petId}/medical-records`,
            data
        );
        return response.data;
    },

    // 진료기록 수정
    update: async (
        petId: number,
        recordId: number,
        data: UpdateMedicalRecordRequest
    ): Promise<string> => {
        const response = await axiosInstance.put<string>(
            `/pets/${petId}/medical-records/${recordId}`,
            data
        );
        return response.data;
    },

    // 진료기록 삭제
    delete: async (
        petId: number,
        recordId: number
    ): Promise<string> => {
        const response = await axiosInstance.delete<string>(
            `/pets/${petId}/medical-records/${recordId}`
        );
        return response.data;
    },

    // 청구서 분석 (GPT-4o)
    analyzeReceipt: async (
        petId: number,
        file: File
    ): Promise<ReceiptAnalysisResponse> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post<ReceiptAnalysisResponse>(
            `/pets/${petId}/medical-records/analyze-receipt`,
            formData
        );
        return response.data;
    },

    // 파일 업로드
    uploadFile: async (
        file: File,
        fileType: 'MEDICAL_DOCUMENT' | 'MEDICAL_RECEIPT',
        relatedEntityType?: string,
        relatedEntityId?: number
    ): Promise<FileUploadResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('fileType', fileType);
        formData.append('accessType', 'PRIVATE');

        if (relatedEntityType) {
            formData.append('relatedEntityType', relatedEntityType);
        }
        if (relatedEntityId) {
            formData.append('relatedEntityId', relatedEntityId.toString());
        }

        // 디버깅 로그
        console.log('📤 파일 업로드 요청:');
        console.log('- 파일명:', file.name);
        console.log('- 파일 타입:', file.type);
        console.log('- 파일 크기:', file.size);
        console.log('- fileType:', fileType);
        console.log('- accessType: PRIVATE');
        console.log('- relatedEntityType:', relatedEntityType);
        console.log('- relatedEntityId:', relatedEntityId);

        try {
            const response = await axiosInstance.post<FileUploadResponse>(
                '/pets/files/upload',
                formData
            );
            console.log('✅ 업로드 성공:', response.data);
            return response.data;
        } catch (error: any) {
            console.error('❌ 업로드 실패:');
            console.error('- Status:', error.response?.status);
            console.error('- Data:', error.response?.data);
            console.error('- Error:', error.message);
            throw error;
        }
    },

    // 파일 삭제
    deleteFile: async (fileId: number): Promise<string> => {
        const response = await axiosInstance.delete<string>(
            `/pets/files/${fileId}`
        );
        return response.data;
    }
};

// ==================== 유틸리티 함수 ====================

export const formatMedicalDate = (dateString: string): string => {
    return dateString.replace(/-/g, '.');
};

export const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export const formatAmount = (amount?: number): string => {
    if (!amount) return '0원';
    return `${amount.toLocaleString()}원`;
};

export const validateMedicalRecord = (
    data: RegisterMedicalRecordRequest | UpdateMedicalRecordRequest
): void => {
    if (!data.visitDate) {
        throw new Error('진료일자를 입력해주세요.');
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(data.visitDate)) {
        throw new Error('올바른 날짜 형식이 아닙니다.');
    }

    const visitDate = new Date(data.visitDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (visitDate > today) {
        throw new Error('진료일자는 미래일 수 없습니다.');
    }
};

export const validateItem = (
    item: TestItemDto | TreatmentItemDto | MedicationItemDto
): void => {
    if (!item.name?.trim()) {
        throw new Error('항목 이름을 입력해주세요.');
    }

    if (item.quantity !== undefined && item.quantity < 0) {
        throw new Error('수량은 0 이상이어야 합니다.');
    }

    if (item.unitPrice !== undefined && item.unitPrice < 0) {
        throw new Error('단가는 0 이상이어야 합니다.');
    }

    if (item.amount !== undefined && item.amount < 0) {
        throw new Error('금액은 0 이상이어야 합니다.');
    }
};