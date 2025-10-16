import { useState, useEffect } from 'react';
import type { Pet } from '../../types/types.ts';
import PetProfileCard from '../../components/PetProfileCard.tsx';
import PetModal from '../../components/PetModal.tsx';
import AlertNotification from '../../../shared/components/AlertNotification.tsx';
import ConfirmModal from '../../components/ConfirmModel.tsx';
import { getDefaultImageUrl } from '../../utils/petUtils.ts';

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
    const [alert, setAlert] = useState<{ message: string; show: boolean }>({ message: '', show: false });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [petToDeleteId, setPetToDeleteId] = useState<number | null>(null);

    useEffect(() => {
        const savedPetsData = localStorage.getItem('myPetsData');
        let petsToLoad: Pet[];

        if (savedPetsData) {
            const parsedPets: Pet[] = JSON.parse(savedPetsData);
            petsToLoad = parsedPets.map(pet => {
                const originalUrl = pet.imageUrl;
                const isValidUrl = originalUrl && (originalUrl.startsWith('data:') || originalUrl.includes('githubusercontent'));
                const newUrl = isValidUrl ? originalUrl : getDefaultImageUrl(pet.type);

                return {
                    ...pet,
                    surveyCount: typeof pet.surveyCount === 'number' ? pet.surveyCount : 0,
                    lastSurveyDate: pet.lastSurveyDate || '',
                    aiReports: Array.isArray(pet.aiReports) ? pet.aiReports : [],
                    imageUrl: newUrl,
                };
            });
        } else {
            petsToLoad = initialPetsData;
        }
        setPets(petsToLoad);
        localStorage.setItem('myPetsData', JSON.stringify(petsToLoad));
    }, []);

    const updatePetsData = (newPets: Pet[]) => {
        setPets(newPets);
        localStorage.setItem('myPetsData', JSON.stringify(newPets));
    }

    const showAlert = (message: string) => {
        setAlert({ message, show: true });
        setTimeout(() => setAlert({ message: '', show: false }), 3000);
    };

    const handleOpenRegistration = (registrationUrl: string) => {
        if (registrationUrl) {
            if (registrationUrl.startsWith('blob:') || registrationUrl.startsWith('data:')) {
                window.open(registrationUrl, '_blank');
            } else {
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
                    return {
                        ...p,
                        type: petData.type,
                        name: petData.name,
                        gender: petData.gender,
                        mainBreed: petData.mainBreed,
                        subBreed: petData.subBreed || '',
                        customBreed: petData.customBreed || '',
                        dob: petData.dob,
                        imageUrl: petData.imageDataUrl || p.imageUrl,
                        hasMicrochip: petData.hasMicrochip || false,
                        isNeutered: petData.isNeutered || false,
                        registrationNum: petData.registrationNumber || '',
                        registrationUrl: petData.registrationFile ? URL.createObjectURL(petData.registrationFile) : p.registrationUrl,
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
                               onClose={() => setAlert({ ...alert, show: false })}/>
            <ConfirmModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={handleConfirmDelete}
                          title="삭제 확인" message="나의 펫을 정말 삭제하시겠어요?"/>
        </div>
    );
};

export default MyPetPage;