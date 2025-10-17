import axiosInstance from './axiosConfig';

// ==================== 타입 정의 ====================

// Species enum
export type Species = 'DOG' | 'CAT' | 'OTHER';

// Pet 등록 요청 타입
export interface RegisterPetAccountRequest {
    name: string;
    species: Species;
    mainBreedId?: number | null;
    customMainBreedName?: string | null;
    subBreedId?: number | null;
    gender: string; // "MALE", "FEMALE", "UNKNOWN"
    birthday: string; // "yyyy-MM-dd"
    isNeutered: boolean;
    hasMicrochip: boolean;
    registrationNum?: number | null;
    profileImg?: File | null;
    registerPdf?: File | null;
}

// Pet 수정 요청 타입
export interface UpdatePetAccountRequest {
    name: string;
    mainBreedId?: number | null;
    customMainBreedName?: string | null;
    subBreedId?: number | null;
    gender: string;
    birthday: string;
    isNeutered: boolean;
    hasMicrochip: boolean;
    registrationNum?: number | null;
    profileImg?: File | null;
    registerPdf?: File | null;
    deleteProfileImg?: boolean;
    deleteRegistrationPdf?: boolean;
}

// Pet 응답 타입 (백엔드 ReadPetAccountResponse)
export interface PetAccountResponse {
    petId: number;
    name: string;
    species: Species;
    mainBreedId: number | null;
    mainBreedName: string | null;
    customMainBreedName: string | null;
    subBreedId: number | null;
    subBreedName: string | null;
    gender: string;
    birthday: string;
    isNeutered: boolean;
    hasMicrochip: boolean;
    registrationNum: number | null;
    profileImgUrl: string | null;
    registrationPdfUrl: string | null;
    createdAt: string;
}

// 펫 목록 응답
export interface ListPetAccountResponse {
    pets: PetAccountResponse[];
}

// 등록/수정 성공 응답
export interface RegisterPetAccountResponse {
    name: string;
}

export interface UpdatePetAccountResponse {
    name: string;
}

// ==================== API 서비스 ====================

export const petApi = {
    // 펫 등록, POST /api/pets/profiles
    registerPet: async (request: RegisterPetAccountRequest): Promise<RegisterPetAccountResponse> => {
        const formData = createPetFormData(request);

        const response = await axiosInstance.post<RegisterPetAccountResponse>(
            '/pets/profiles',
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },

    // 펫 목록 조회, GET /api/pets/profiles
    getAllPets: async (): Promise<PetAccountResponse[]> => {
        const response = await axiosInstance.get<ListPetAccountResponse>('/pets/profiles');
        return response.data.pets;
    },

    // 특정 펫 조회, GET /api/pets/profiles/{petId}
    getPet: async (petId: number): Promise<PetAccountResponse> => {
        const response = await axiosInstance.get<PetAccountResponse>(`/pets/profiles/${petId}`);
        return response.data;
    },

    // 펫 정보 수정, PUT /api/pets/profiles/{petId}
    updatePet: async (petId: number, request: UpdatePetAccountRequest): Promise<UpdatePetAccountResponse> => {
        const formData = createPetFormData(request, true);

        const response = await axiosInstance.put<UpdatePetAccountResponse>(
            `/pets/profiles/${petId}`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },

    // 펫 삭제, DELETE /api/pets/profiles/{petId}
    deletePet: async (petId: number): Promise<string> => {
        const response = await axiosInstance.delete<string>(`/pets/profiles/${petId}`);  // 수정
        return response.data;
    },

    // 프로필 이미지만 업로드
    uploadProfileImage: async (petId: number, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post(
            `/pets/profiles/${petId}/profile-image`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },

    // 등록증만 업로드
    uploadRegistration: async (petId: number, file: File): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await axiosInstance.post(
            `/pets/profiles/${petId}/registration`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );

        return response.data;
    },
};

// 품종(Breed) API
export const breedApi = {
    // 품종 목록 조회, GET /api/pets/breeds?species=...
    getBreeds: async (species?: Species): Promise<any[]> => {
        const response = await axiosInstance.get('/pets/breeds/dropdown', { params: {species} });
        if (response.data && Array.isArray(response.data.breedList)) {
            return response.data.breedList;
        }

        return [];
    },
};


// ==================== 유틸리티 함수 ====================

// FormData 생성 헬퍼
const createPetFormData = (request: RegisterPetAccountRequest | UpdatePetAccountRequest, isUpdate = false): FormData => {
    const formData = new FormData();

    if (!isUpdate && 'species' in request) {
        formData.append('species', request.species);
    }

    // 필수 필드
    formData.append('name', request.name);
    formData.append('gender', request.gender);
    formData.append('birthday', request.birthday);
    formData.append('isNeutered', String(request.isNeutered));
    formData.append('hasMicrochip', String(request.hasMicrochip));

    // 선택적 필드
    if (request.mainBreedId) {
        formData.append('mainBreedId', String(request.mainBreedId));
    }
    if (request.customMainBreedName) {
        formData.append('customMainBreedName', request.customMainBreedName);
    }
    if (request.subBreedId) {
        formData.append('subBreedId', String(request.subBreedId));
    }
    if (request.registrationNum) {
        formData.append('registrationNum', String(request.registrationNum));
    }

    // 파일
    if (request.profileImg) {
        formData.append('profileImg', request.profileImg);
    }
    if (request.registerPdf) {
        formData.append('registrationPdf', request.registerPdf);
    }

    // 수정 요청인 경우 삭제 플래그 추가
    if (isUpdate) {
        const updateRequest = request as UpdatePetAccountRequest;
        if (updateRequest.deleteProfileImg !== undefined) {
            formData.append('deleteProfileImg', String(updateRequest.deleteProfileImg));
        }
        if (updateRequest.deleteRegistrationPdf !== undefined) {
            formData.append('deleteRegistrationPdf', String(updateRequest.deleteRegistrationPdf));
        }
    }

    return formData;
};

// 프론트엔드 Pet 데이터를 백엔드 요청 형식으로 변환
export const convertPetToRegisterRequest = (pet: any): RegisterPetAccountRequest => {
    // 성별 매핑
    const genderMap: { [key: string]: string } = {
        '남아': 'MALE',
        '여아': 'FEMALE',
        '정보없음': 'UNKNOWN',
    };

    return {
        name: pet.name,
        mainBreedId: pet.mainBreedId || null,
        customMainBreedName: pet.customBreed || pet.customMainBreedName || null,
        subBreedId: pet.subBreedId || null,
        gender: genderMap[pet.gender] || pet.gender || 'UNKNOWN',
        birthday: pet.dob || pet.birthday,
        isNeutered: pet.isNeutered || false,
        hasMicrochip: pet.hasMicrochip || false,
        registrationNum: pet.registrationNum ? Number(pet.registrationNum) : null,
        profileImg: pet.profileImg || null,
        registerPdf: pet.registrationFile || pet.registerPdf || null,
    };
};

// 백엔드 응답을 프론트엔드 Pet 형식으로 변환
export const convertResponseToPet = (response: PetAccountResponse): any => {
    // 성별 역매핑
    const genderMap: { [key: string]: string } = {
        'MALE': '남아',
        'FEMALE': '여아',
        'UNKNOWN': '정보없음',
    };

    // Species를 type으로 변환
    const typeMap: { [key in Species]: 'dog' | 'cat' | 'other' } = {
        'DOG': 'dog',
        'CAT': 'cat',
        'OTHER': 'other',
    };

    return {
        id: response.petId,
        type: typeMap[response.species],
        name: response.name,
        gender: genderMap[response.gender] || '정보없음',
        mainBreed: response.mainBreedName || response.customMainBreedName || '',
        mainBreedId: response.mainBreedId,
        subBreed: response.subBreedName || '',
        subBreedId: response.subBreedId,
        customBreed: response.customMainBreedName || '',
        dob: response.birthday,
        imageUrl: response.profileImgUrl || '',
        hasMicrochip: response.hasMicrochip,
        isNeutered: response.isNeutered,
        registrationNum: response.registrationNum?.toString() || '',
        registrationUrl: response.registrationPdfUrl || '',
        dailyMission: [],
        hasRerolledToday: false,
        lastMissionDate: '',
        surveyCount: 0,
        lastSurveyDate: '',
        weightRecords: [],
        healthNotes: [],
        heatCycles: [],
        aiReports: [],
    };
};

// 에러 처리 유틸리티
export const handleApiError = (error: any): string => {
    if (error.response) {
        // 서버에서 응답한 에러
        const message = error.response.data?.message || error.response.data;
        return typeof message === 'string' ? message : '서버 오류가 발생했습니다.';
    } else if (error.request) {
        // 요청은 보냈으나 응답이 없음
        return '서버와 연결할 수 없습니다.';
    } else {
        // 요청 설정 중 오류
        return error.message || '알 수 없는 오류가 발생했습니다.';
    }
};