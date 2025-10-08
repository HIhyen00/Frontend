import {useState, useEffect} from 'react';
import type {Pet, DailyMission} from '../../types/types.ts';
import PetProfileCard from '../../components/PetProfileCard.tsx';
import PetModal from '../../components/PetModal.tsx';
import AlertNotification from '../../../shared/components/AlertNotification.tsx';
import ConfirmModal from '../../components/ConfirmModel.tsx';
import {getDefaultImageUrl} from '../../utils/petUtils.ts';

// PetModal에서 전달하는 데이터 타입을 정의합니다.
interface PetFormData {
    id?: number;
    type: 'dog' | 'cat' | 'other';
    name: string;
    gender: '남아' | '여아' | '정보없음';
    mainBreed: string;
    subBreed?: string | null;
    customBreed?: string | null;
    dob: string;
    imageDataUrl?: string | null;
    isNeutered?: boolean;
    hasMicrochip?: boolean;
    registrationNumber?: string;
    registrationFile?: File | null;

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
        '상자에 몸 구겨넣기', '우다다 한판하기',
        '박스 미로 탈출하기', '터널 장난감 탐험', '빛 레이저 쫓기 놀이', '슬로우 피딩 챌린지',
        '캣닢 쿠션 꾹꾹이', '주인 얼굴에 박치기하기', '간식 자동 급식기 체험', '새로운 고양이 친구 만나보기',
        '캣휠 달리기 5분', '몰래 숨어서 고양이 놀래키기'
    ],
    other: [
        '쳇바퀴 30분 타기 (햄스터)', '해바라기씨 까먹기 (앵무새/햄스터)', '새로운 노래 배우기 (앵무새)',
        '따뜻한 물에 몸 담그기 (거북이)', '은신처에서 꿀잠자기', '신선한 야채 먹기', '주인과 핸들링 5분', '케이지 탐험하기',
        '거북이 UVB 램프 쬐기 10분', '앵무새 소리 따라하기', '햄스터 터널 확장 탐험', '토끼 풀밭 산책',
        '고슴도치 손에 올려보기', '앵무새 퍼즐 피더 열기', '파충류 피부 미스트 뿌리기', '작은 공 굴리기 놀이',
        '햄스터 모래목욕하기', '거북이 육지-물 왕복 놀이'
    ]
};

const generateRandomMissions = (petType: 'dog' | 'cat' | 'other'): DailyMission[] => {
    const pool = MISSION_POOL[petType];
    const missionCount = Math.floor(Math.random() * 5) + 1;
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, missionCount).map(task => ({ task, done: false }));
};

// 샘플데이터
const initialPetsData: Pet[] = [
    {
        id: 1,
        type: 'dog',
        name: '왕만두',
        gender: '남아',
        mainBreed: '비숑 프리제',
        subBreed: '',
        customBreed: '',
        dob: '2022-04-13',
        hasMicrochip: true,
        isNeutered: true,
        imageUrl: getDefaultImageUrl('dog'),
        registrationNum: '123456789123456',
        registrationUrl: '',
        dailyMission: [],
        hasRerolledToday: false,
        lastMissionDate: '',
        surveyCount: 0,
        lastSurveyDate: '',
        weightRecords: [],
        healthNotes: [],
        heatCycles: [],
        aiReports: [],
    },
    {
        id: 2,
        type: 'cat',
        name: '정범이',
        gender: '여아',
        mainBreed: '코리안 숏헤어',
        subBreed: '',
        customBreed: '',
        dob: '2020-09-28',
        hasMicrochip: true,
        isNeutered: false,
        imageUrl: getDefaultImageUrl('cat'),
        registrationNum: '123456789789789',
        registrationUrl: '',
        dailyMission: [],
        hasRerolledToday: false,
        lastMissionDate: '',
        surveyCount: 0,
        lastSurveyDate: '',
        weightRecords: [],
        healthNotes: [],
        heatCycles: [],
        aiReports: [],
    },
    {
        id: 3,
        type: 'other',
        name: '코코',
        gender: '남아',
        mainBreed: '왕관앵무',
        subBreed: '',
        customBreed: '',
        dob: '2023-01-15',
        hasMicrochip: false,
        isNeutered: false,
        imageUrl: getDefaultImageUrl('other'),
        registrationNum: '123123789123456',
        registrationUrl: '',
        dailyMission: [],
        hasRerolledToday: false,
        lastMissionDate: '',
        surveyCount: 0,
        lastSurveyDate: '',
        weightRecords: [],
        healthNotes: [],
        heatCycles: [],
        aiReports: [],
    }
];

const MyPetPage: React.FC = () => {
    const [pets, setPets] = useState<Pet[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentPet, setCurrentPet] = useState<Pet | null>(null);
    const [alert, setAlert] = useState<{ message: string; show: boolean }>({message: '', show: false});
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [petToDeleteId, setPetToDeleteId] = useState<number | null>(null);

    useEffect(() => {
        const today = new Date().toISOString().slice(0, 10);
        const savedPetsData = localStorage.getItem('myPetsData');
        let petsToLoad: Pet[];

        if (savedPetsData) {
            const parsedPets: Pet[] = JSON.parse(savedPetsData);
            petsToLoad = parsedPets.map(pet => {
                const originalUrl = pet.imageUrl;
                const isValidUrl = originalUrl && (originalUrl.startsWith('data:') || originalUrl.includes('githubusercontent'));
                const newUrl = isValidUrl ? originalUrl : getDefaultImageUrl(pet.type);

                const migratedPet = {
                    ...pet,
                    surveyCount: typeof pet.surveyCount === 'number' ? pet.surveyCount : 0,
                    lastSurveyDate: pet.lastSurveyDate || '',
                    aiReports: Array.isArray(pet.aiReports) ? pet.aiReports : [],
                    imageUrl: newUrl,
                    dailyMission: pet.dailyMission || generateRandomMissions(pet.type),
                    hasRerolledToday: pet.hasRerolledToday || false,
                    lastMissionDate: pet.lastMissionDate || today,
                };

                if (migratedPet.lastMissionDate !== today) {
                    return {
                        ...migratedPet,
                        dailyMission: generateRandomMissions(migratedPet.type),
                        hasRerolledToday: false,
                        lastMissionDate: today
                    };
                }
                return migratedPet;
            });
        } else {
            petsToLoad = initialPetsData.map(p => ({
                ...p,
                dailyMission: generateRandomMissions(p.type),
                lastMissionDate: today,
            }));
        }
        setPets(petsToLoad);
        localStorage.setItem('myPetsData', JSON.stringify(petsToLoad));
    }, []);

    const updatePetsData = (newPets: Pet[]) => {
        setPets(newPets);
        localStorage.setItem('myPetsData', JSON.stringify(newPets));
    }

    const showAlert = (message: string) => {
        setAlert({message, show: true});
        setTimeout(() => setAlert({message: '', show: false}), 3000);
    };

    const handleToggleMission = (petId: number, task: string) => {
        const newPets = pets.map(pet => {
            if (pet.id === petId) {
                const updatedMissions = pet.dailyMission.map(mission =>
                    mission.task === task ? {...mission, done: !mission.done} : mission
                );
                return {...pet, dailyMission: updatedMissions};
            }
            return pet;
        });
        updatePetsData(newPets);
    };

    const handleRerollMissions = (petId: number) => {
        const newPets = pets.map(pet => {
            if (pet.id === petId && !pet.hasRerolledToday) {
                showAlert(`${pet.name}의 미션을 새로고침합니다!`);
                return {...pet, dailyMission: generateRandomMissions(pet.type), hasRerolledToday: true};
            }
            return pet;
        });
        updatePetsData(newPets);
    };

    const handleOpenRegistration = (registrationUrl: string) => {
        if (registrationUrl) {
            // 파일 URL이 blob: 형태인 경우 새 창에서 열기
            if (registrationUrl.startsWith('blob:') || registrationUrl.startsWith('data:')) {
                window.open(registrationUrl, '_blank');
            } else {
                // 일반 URL인 경우 다운로드 또는 새 창에서 열기
                const link = document.createElement('a');
                link.href = registrationUrl;
                link.target = '_blank';
                link.click();
            }
        } else {
            showAlert('등록된 동물등록증이 없습니다.');
        }
    };

    const handleSavePet = (petData: PetFormData) => {
        const imageUrl = petData.imageDataUrl || ((modalMode === 'edit' && currentPet) ? currentPet.imageUrl : getDefaultImageUrl(petData.type));
        let newPets: Pet[];

        if (modalMode === 'add') {
            const newPet: Pet = {
                id: Date.now(),
                type: petData.type,
                name: petData.name,
                gender: petData.gender,
                mainBreed: petData.mainBreed,
                subBreed: petData.subBreed || '',
                customBreed: petData.customBreed || '',
                dob: petData.dob,
                imageUrl,
                hasMicrochip: petData.hasMicrochip || false,
                isNeutered: petData.isNeutered || false,
                registrationNum: petData.registrationNumber || '',
                registrationUrl: petData.registrationFile ? URL.createObjectURL(petData.registrationFile) : '',
                dailyMission: generateRandomMissions(petData.type),
                hasRerolledToday: false,
                lastMissionDate: new Date().toISOString().slice(0, 10),
                surveyCount: 0,
                lastSurveyDate: '',
                weightRecords: [],
                healthNotes: [],
                heatCycles: [],
                aiReports: [],
            };

            newPets = [...pets, newPet];
            showAlert('새로운 펫이 등록되었습니다!');
        } else {
            newPets = pets.map(p => {
                if (p.id === currentPet?.id) {
                    const hasTypeChanged = p.type !== petData.type;
                    return {
                        ...p,
                        type: petData.type,
                        name: petData.name,
                        gender: petData.gender,
                        mainBreed: petData.mainBreed,
                        subBreed: petData.subBreed || '',
                        customBreed: petData.customBreed || '',
                        dob: petData.dob,
                        imageUrl: petData.imageDataUrl || p.imageUrl, // Keep old image if new one isn't provided
                        hasMicrochip: petData.hasMicrochip || false,
                        isNeutered: petData.isNeutered || false,
                        registrationNum: petData.registrationNumber || '',
                        registrationUrl: petData.registrationFile ? URL.createObjectURL(petData.registrationFile) : p.registrationUrl,
                        dailyMission: hasTypeChanged ? generateRandomMissions(petData.type) : p.dailyMission,
                        hasRerolledToday: hasTypeChanged ? false : p.hasRerolledToday,
                    };
                }
                return p;
            });
            showAlert(`${petData.name}의 정보가 수정되었습니다.`);
        }
        updatePetsData(newPets);
        setIsModalOpen(false);
    };

    const handleConfirmDelete = () => {
        if (petToDeleteId !== null) {
            const newPets = pets.filter(p => p.id !== petToDeleteId);
            updatePetsData(newPets);
            showAlert(`펫 정보가 삭제되었습니다.`);
        }
        setIsConfirmOpen(false);
        setPetToDeleteId(null);
    };

    const handleAddPet = () => {
        setModalMode('add');
        setCurrentPet(null);
        setIsModalOpen(true);
    };

    const handleEditPet = (pet: Pet) => {
        setModalMode('edit');
        setCurrentPet(pet);
        setIsModalOpen(true);
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
                    className="bg-indigo-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-600 transition-colors duration-300 shadow-md hover:shadow-lg"
                >
                    <i className="fas fa-plus mr-2"></i>새 펫 등록
                </button>
            </header>
            <main>
                {pets.length > 0 ? (
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

            <PetModal isOpen={isModalOpen} onClose={handleCloseModal} onSave={handleSavePet} mode={modalMode}
                      pet={currentPet}/>
            <AlertNotification message={alert.message} show={alert.show}
                               onClose={() => setAlert({...alert, show: false})}/>
            <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete}
                          title="삭제 확인" message="나의 펫을 정말 삭제하시겠어요?"/>
        </div>
    );
};

export default MyPetPage;