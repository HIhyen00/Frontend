import axiosInstance from './axiosConfig';
import type { Pet } from '../types/types';

// ==================== 타입 정의 ====================

// Props 타입
export interface MedicalRecordPageProps {
    pet: Pet;
    onUpdatePet: (pet: Pet) => void;
}

// Species enum
export type Species = 'DOG' | 'CAT' | 'OTHER';

// 백신 정보
export interface Vaccine {
    vaccineId: number;
    species: Species;
    vaccineName: string;
    description?: string;
    sideEffects?: string;
    vaccineCycle?: number;
    createdAt: string;
    updatedAt: string;
}

// 특정 백신 접종 기록
export interface VaccinationRecord {
    id: number;
    petId: number;
    vaccineId?: number | null;
    customVaccineName?: string | null;
    vaccinationDate: string; // YYYY-MM-DD 형식
    hospitalName: string;
    isDeleted: boolean;
}

// 백신 접종 기록 DTO - 리스트 조회
export interface VaccinationRecordDto {
    recordId: number;
    customVaccineName?: string | null;
    vaccinationDate: string;
    hospitalName: string;
}

// 백신과 접종 기록 DTO - 리스트 조회
export interface VaccineWithRecordDto {
    vaccineId: number | null;
    vaccineName: string;
    description?: string;
    vaccinationRecords: VaccinationRecordDto[];
}

// ==================== Request/Response 타입 ====================

// VacRecord 등록 요청 타입
export interface RegisterVacRecordRequest {
    vaccineId?: number | null;
    customVaccineName?: string | null;
    vaccinationDate: string; // YYYY-MM-DD
    hospitalName: string;
}

// VacRecord 수정 요청 타입
export interface UpdateVacRecordRequest {
    customVaccineName?: string | null;
    vaccinationDate: string; // YYYY-MM-DD
    hospitalName: string;
}

// VacRecord 단건 조회 응답 타입
export interface ReadVacRecordResponse {
    vaccineId?: number | null;
    vaccineName?: string;
    customVaccineName?: string | null;
    vaccinationDate: string;
    hospitalName: string;
}

// VacRecord 리스트 조회 응답 타입
export interface ListVacRecordResponse {
    vacRecords: VaccineWithRecordDto[];
}

// ==================== API 서비스 ====================

export const vaccinationRecordApi = {

    // 백신 접종 기록 등록, POST /api/pets/{petId}/vac-records/register
    register: async (
        petId: number,
        data: RegisterVacRecordRequest
    ): Promise<string> => {
        const response = await axiosInstance.post<string>(
            `/pets/${petId}/vac-records`,
            data
        );
        return response.data;
    },

    // 백신 접종 기록 단건 조회, GET /api/pets/{petId}/vac-records/{recordId}
    getById: async (
        petId: number,
        recordId: number
    ): Promise<ReadVacRecordResponse> => {
        const response = await axiosInstance.get<ReadVacRecordResponse>(
            `/pets/${petId}/vac-records/${recordId}`
        );
        return response.data;
    },

    // 백신 접종 기록 목록 조회, GET /api/pets/{petId}/vac-records
    getList: async (petId: number): Promise<ListVacRecordResponse> => {
        const response = await axiosInstance.get<ListVacRecordResponse>(
            `/pets/${petId}/vac-records`
        );
        return response.data;
    },

    // 백신 접종 기록 수정, PUT /api/pets/{petId}/vac-records/{recordId}
    update: async (
        petId: number,
        recordId: number,
        data: UpdateVacRecordRequest
    ): Promise<string> => {
        const response = await axiosInstance.put<string>(
            `/pets/${petId}/vac-records/${recordId}`,
            data
        );
        return response.data;
    },

    // 백신 접종 기록 삭제, DELETE /api/pets/{petId}/vac-records/{recordId}
    delete: async (petId: number, recordId: number): Promise<string> => {
        const response = await axiosInstance.delete<string>(
            `/pets/${petId}/vac-records/${recordId}`
        );
        return response.data;
    },
};

// ==================== 유틸리티 함수 ====================

// 백신 접종 기록 날짜 포맷팅, 프론트엔드 UI 표시용 (YYYY-MM-DD → YYYY.MM.DD)
export const formatVaccinationDate = (dateString: string): string => {
    return dateString.replace(/-/g, '.');
};

// 오늘 날짜를 YYYY-MM-DD 형식으로 반환, date input의 기본값 설정용
export const getTodayDate = (): string => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// 접종 차수 포맷, 프론트엔드 UI 표시용 (1 → "1차")
export const formatDoseOrder = (order: number): string => {
    return `${order}차`;
};

// 백신 등록 요청 데이터 검증 (클라이언트 측 validation)
export const validateVaccinationRecord = (
    data: RegisterVacRecordRequest | UpdateVacRecordRequest
): void => {
    if (!data.vaccinationDate) {
        throw new Error('접종 날짜를 입력해주세요.');
    }

    if (!data.hospitalName?.trim()) {
        throw new Error('병원 이름을 입력해주세요.');
    }

    // 등록 요청인 경우 추가 검증
    if ('vaccineId' in data) {
        const hasVaccine = data.vaccineId != null && data.vaccineId !== 0;
        const hasCustomName =
            data.customVaccineName != null &&
            data.customVaccineName.trim() !== '';

        if (!hasVaccine && !hasCustomName) {
            throw new Error('백신 정보를 선택하거나 직접 입력해주세요.');
        }

        if (hasVaccine && hasCustomName) {
            throw new Error(
                '등록된 백신과 직접 입력을 동시에 사용할 수 없습니다.'
            );
        }
    }
};