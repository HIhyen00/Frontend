import { useState, useEffect } from 'react';
import type { Pet, DailyMission } from '../../types/types.ts';
import PetProfileCard from '../../components/PetProfileCard.tsx';
import PetModal from '../../components/PetModal.tsx';
import AlertNotification from '../../../shared/components/AlertNotification.tsx';
import ConfirmModal from '../../components/ConfirmModel.tsx';
import { getDefaultImageUrl } from '../../utils/petUtils.ts';
import { petApi, convertPetToRegisterRequest, convertResponseToPet, handleApiError } from '../../utils/petApi.ts';

// PetModal에서 전달하는 데이터 타입
interface PetFormData {
    id?: number;
    type: 'dog' | 'cat' | 'other';
    name: string;
    gender: '남아' | '여아' | '정보없음';
    mainBreed: string;
    mainBreedId?: number;
    subBreed?: string | null;
    subBreedId?: number;
    customBreed?: string | null;
    dob: string;
    imageDataUrl?: string | null;
    imageFile?: File | null;
    deleteProfileImg?: boolean;
    isNeutered?: boolean;
    hasMicrochip?: boolean;
    registrationNumber?: string;
    registrationFile?: File | null;
    deleteRegistrationPdf?: boolean;
}

// 데일리미션 설정
const MISSION_POOL = {
    dog: [
        '공원에서 산책 30분', '새로운 강아지 친구 사귀기', '간식 숨겨놓고 노즈워크', '양치질 깨끗하게 하기',
        '산책 후 발 닦기', '빗질 5분 이상', '기본 훈련 복습 (앉아, 기다려)', '새 장난감 가지고 놀기',
        '주인과 교감하기 (쓰다듬기)', '사료 남기지 않고 다 먹기', '창밖 구경하기', '낮잠 1시간 자기',
        '볼 던지고 물어오기 놀이 10회', '하울링 소리내기 챌린지', '새로운 트릭 배우기 (돌아, 하이파이브)',
        '미니 어질리티 코스 체험', '물놀이 10분', '강아지 마사지 5분', '퍼즐 장난감 풀기',
        '천천히 먹기 훈련', '집 안에서 숨바꼭질하기', '거품 목욕하기'
    ],
    cat: [
        '스크래쳐 신나게 긁기', '사냥 놀이 15분', '캣타워 꼭대기 정복', '창밖 새 구경하기', '츄르 맛있게 먹기',
        '정성껏 그루밍하기', '주인 무릎에서 잠자기', '새로운 숨숨집 탐험', '깃털 장난감으로 놀기', '물 많이 마시기',
        '상자에 몸 구겨넣기', '우다다 한판하기', '박스 미로 탈출하기', '터널 장난감 탐험', '빛 레이저 쫓기 놀이',
        '슬로우 피딩 챌린지', '캣닢 쿠션 꾹꾹이', '주인 얼굴에 박치기하기', '간식 자동 급식기 체험',
        '새로운 고양이 친구 만나보기', '캣휠 달리기 5분', '몰래 숨어서 고양이 놀래키기'
    ],
    other: [
        '쳇바퀴 30분 타기 (햄스터)', '해바라기씨 까먹기 (앵무새/햄스터)', '새로운 노래 배우기 (앵무새)',
        '따뜻한 물에 몸 담그기 (거북이)', '은신처에서 꿀잠자기', '신선한 야채 먹기', '주인과 핸들링 5분',
        '케이지 탐험하기', '거북이 UVB 램프 쬐기 10분', '앵무새 소리 따라하기', '햄스터 터널 확장 탐험',
        '토끼 풀밭 산책', '고슴도치 손에 올려보기', '앵무새 퍼즐 피더 열기', '파충류 피부 미스트 뿌리기',
        '작은 공 굴리기 놀이', '햄스터 모래목욕하기', '거북이 육지-물 왕복 놀이'
    ]
};

const generateRandomMissions = (petType: 'dog' | 'cat' | 'other'): DailyMission[] => {
    const pool = MISSION_POOL[petType];
    const missionCount = Math.floor(Math.random() * 5) + 1;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, missionCount).map(task => ({ task, done: false }));
};

const MyPetPage: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentPet, setCurrentPet] = useState<Pet | null>(null);
    const [alert, setAlert] = useState<{ message: string; show: boolean }>({ message: '', show: false });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [petToDeleteId, setPetToDeleteId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 초기 펫 목록 로드
    useEffect(() => {
        fetchPets();
    }, []);

    // 매일 자정에 미션 리셋
    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        const updatedPets = pets.map(pet => {
            if (pet.lastMissionDate !== today) {
                return {
                    ...pet,
                    dailyMission: generateRandomMissions(pet.type),
                    hasRerolledToday: false,
                    lastMissionDate: today
                };
            }
            return pet;
        });

        if (JSON.stringify(pets) !== JSON.stringify(updatedPets)) {
            setPets(updatedPets);
            updateLocalStorage(updatedPets);
        }
    }, [pets]);

    const fetchPets = async () => {
        setIsLoading(true);
        try {
            const responses = await petApi.getAllPets();
            const convertedPets = responses.map(response => {
                const pet = convertResponseToPet(response);
                const today = new Date().toISOString().slice(0, 10);

                // localStorage에서 미션 정보 복원
                const savedData = localStorage.getItem(`pet_${pet.id}_missions`);
                if (savedData) {
                    const { dailyMission, hasRerolledToday, lastMissionDate } = JSON.parse(savedData);
                    if (lastMissionDate === today) {
                        pet.dailyMission = dailyMission;
                        pet.hasRerolledToday = hasRerolledToday;
                        pet.lastMissionDate = lastMissionDate;
                    } else {
                        pet.dailyMission = generateRandomMissions(pet.type);
                        pet.hasRerolledToday = false;
                        pet.lastMissionDate = today;
                    }
                } else {
                    pet.dailyMission = generateRandomMissions(pet.type);
                    pet.lastMissionDate = today;
                }

                return pet;
            });

            setPets(convertedPets);
            updateLocalStorage(convertedPets);
        } catch (error) {
            console.error('펫 목록 조회 실패:', error);
            showAlert(handleApiError(error));

            // API 실패 시 localStorage 백업 사용
            const savedData = localStorage.getItem('myPetsData');
            if (savedData) {
                const parsedPets = JSON.parse(savedData);
                setPets(parsedPets);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const updateLocalStorage = (petsData: Pet[]) => {
        // 전체 펫 데이터 저장
        localStorage.setItem('myPetsData', JSON.stringify(petsData));

        // 각 펫의 미션 정보 개별 저장
        petsData.forEach(pet => {
            localStorage.setItem(`pet_${pet.id}_missions`, JSON.stringify({
                dailyMission: pet.dailyMission,
                hasRerolledToday: pet.hasRerolledToday,
                lastMissionDate: pet.lastMissionDate
            }));
        });
    };

    const showAlert = (message: string) => {
        setAlert({ message, show: true });
        setTimeout(() => setAlert({ message: '', show: false }), 3000);
    };

    const handleToggleMission = (petId: number, task: string) => {
        const newPets = pets.map(pet => {
            if (pet.id === petId) {
                const updatedMissions = pet.dailyMission.map(mission =>
                    mission.task === task ? { ...mission, done: !mission.done } : mission
                );
                return { ...pet, dailyMission: updatedMissions };
            }
            return pet;
        });
        setPets(newPets);
        updateLocalStorage(newPets);
    };

    const handleRerollMissions = (petId: number) => {
        const newPets = pets.map(pet => {
            if (pet.id === petId && !pet.hasRerolledToday) {
                showAlert(`${pet.name}의 미션을 새로고침합니다!`);
                return {
                    ...pet,
                    dailyMission: generateRandomMissions(pet.type),
                    hasRerolledToday: true
                };
            }
            return pet;
        });
        setPets(newPets);
        updateLocalStorage(newPets);
    };

    const handleOpenRegistration = (registrationUrl: string) => {
        if (registrationUrl) {
            window.open(registrationUrl, '_blank');
        } else {
            showAlert('등록된 동물등록증이 없습니다.');
        }
    };

    const handleSavePet = async (petData: PetFormData) => {
        setIsLoading(true);
        try {
            // 프론트엔드 데이터를 백엔드 요청 형식으로 변환
            const request = {
                name: petData.name,
                mainBreedId: petData.mainBreedId || null,
                customMainBreedName: petData.customBreed || null,
                subBreedId: petData.subBreedId || null,
                gender: petData.gender === '남아' ? 'MALE' : petData.gender === '여아' ? 'FEMALE' : 'UNKNOWN',
                birthday: petData.dob,
                isNeutered: petData.isNeutered || false,
                hasMicrochip: petData.hasMicrochip || false,
                registrationNum: petData.registrationNumber ? Number(petData.registrationNumber) : null,
                profileImg: petData.imageFile || null,
                registerPdf: petData.registrationFile || null,
            };

            if (modalMode === 'add') {
                const response = await petApi.registerPet(request);
                showAlert(`${response?.name || petData.name}이(가) 등록되었습니다!`);
            } else if (currentPet) {
                const response = await petApi.updatePet(currentPet.id, request);
                showAlert(`${response?.name || petData.name || currentPet.name}의 정보가 수정되었습니다.`);
            }

            // 목록 새로고침
            await fetchPets();
            setIsModalOpen(false);
        } catch (error) {
            console.error('펫 저장 실패:', error);
            showAlert(handleApiError(error));
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (petToDeleteId !== null) {
            setIsLoading(true);
            try {
                await petApi.deletePet(petToDeleteId);
                showAlert('펫이 삭제되었습니다.');

                // 로컬에서 미션 데이터도 삭제
                localStorage.removeItem(`pet_${petToDeleteId}_missions`);

                // 목록 새로고침
                await fetchPets();
            } catch (error) {
                console.error('펫 삭제 실패:', error);
                showAlert(handleApiError(error));
            } finally {
                setIsLoading(false);
                setIsConfirmOpen(false);
                setPetToDeleteId(null);
            }
        }
    };

    const handleAddPet = () => {
        setModalMode('add');
        setCurrentPet(null);
        setIsModalOpen(true);
    };

    const handleEditPet = async (pet: Pet) => {
        setIsLoading(true);
        try {
            // API에서 최신 데이터 가져오기
            const latestPetData = await petApi.getPet(pet.id);
            const convertedPet = convertResponseToPet(latestPetData);

            // 미션 정보는 현재 로컬 데이터 유지
            convertedPet.dailyMission = pet.dailyMission;
            convertedPet.hasRerolledToday = pet.hasRerolledToday;
            convertedPet.lastMissionDate = pet.lastMissionDate;

            setModalMode('edit');
            setCurrentPet(convertedPet);
            setIsModalOpen(true);
        } catch (error) {
            console.error('펫 정보 조회 실패:', error);
            // 실패 시 기존 데이터 사용
            setModalMode('edit');
            setCurrentPet(pet);
            setIsModalOpen(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCloseModal = () => setIsModalOpen(false);

    const handleOpenConfirm = (id: number) => {
        setPetToDeleteId(id);
        setIsConfirmOpen(true);
    };

    return (
        <div className="bg-gray-50 min-h-screen p-12 md:p-32">
            <header className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold text-gray-800">나의 펫</h1>
                <button
                    onClick={handleAddPet}
                    disabled={isLoading}
                    className="bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-600 transition-colors duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i className="fas fa-plus mr-2"></i>새 펫 등록
                </button>
            </header>

            <main>
                {isLoading && pets.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        <p className="mt-4 text-gray-600">펫 정보를 불러오는 중...</p>
                    </div>
                ) : pets.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {pets.map(pet => (
                            <PetProfileCard
                                key={pet.id}
                                pet={pet}
                                onEdit={handleEditPet}
                                onOpenConfirm={handleOpenConfirm}
                                onOpenRegistration={handleOpenRegistration}
                                onShowAlert={showAlert}
                                onToggleMission={handleToggleMission}
                                onRerollMissions={handleRerollMissions}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold text-gray-700">등록된 펫이 없어요.</h2>
                        <p className="text-gray-500 mt-2">오른쪽 위 버튼을 눌러 첫 번째 펫을 등록해보세요!</p>
                    </div>
                )}
            </main>

            <PetModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSavePet}
                mode={modalMode}
                pet={currentPet}
            />

            <AlertNotification
                message={alert.message}
                show={alert.show}
                onClose={() => setAlert({ ...alert, show: false })}
            />

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="삭제 확인"
                message="나의 펫을 정말 삭제하시겠어요?"
            />
        </div>
    );
};

export default MyPetPage;