import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Pet } from '../../types/types.ts';
import PetProfileCard from '../../components/PetProfileCard.tsx';
import PetModal from '../../components/PetModal.tsx';
import AlertNotification from '../../../shared/components/AlertNotification.tsx';
import ConfirmModal from '../../components/ConfirmModel.tsx';
import { petApi, convertResponseToPet, handleApiError } from '../../utils/petApi.ts';
import { useAuth } from '../../../account/hooks/useAuth';


// PetModal에서 전달하는 데이터 타입을 정의합니다.
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

const MyPetPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const [pets, setPets] = useState<Pet[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
    const [currentPet, setCurrentPet] = useState<Pet | null>(null);
    const [alert, setAlert] = useState<{ message: string; show: boolean }>({ message: '', show: false });
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [petToDeleteId, setPetToDeleteId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // 로그인 검증 - authLoading이 끝난 후에만 체크
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { message: '로그인이 필요한 서비스입니다.' } });
        }
    }, [isAuthenticated, authLoading, navigate]);

    // 펫 목록 로드 - API 연결
    useEffect(() => {
        if (isAuthenticated) {
            loadPets();
        }
    }, [isAuthenticated]);

    const loadPets = async () => {
        try {
            setIsLoading(true);
            const petsData = await petApi.getAllPets();
            const convertedPets = petsData.map(convertResponseToPet);
            setPets(convertedPets);
        } catch (error) {
            const errorMessage = handleApiError(error);
            showAlert(`펫 목록을 불러오는데 실패했습니다: ${errorMessage}`);
            console.error('Failed to load pets:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const showAlert = (message: string) => {
        setAlert({ message, show: true });
        setTimeout(() => setAlert({ message: '', show: false }), 3000);
    };

    const handleOpenRegistration = (registrationUrl: string) => {
        if (registrationUrl) {
            window.open(registrationUrl, '_blank');
        } else {
            showAlert('등록된 동물등록증이 없습니다.');
        }
    };

    const handleSavePet = async (petData: PetFormData) => {
        try {
            setIsLoading(true);

            const hasMainBreedId = petData.mainBreedId != null;
            const hasCustomBreed = petData.customBreed && petData.customBreed.trim() !== '';

            if (modalMode === 'add') {

                const speciesMap: { [key: string]: 'DOG' | 'CAT' | 'OTHER' } = {
                    'dog': 'DOG',
                    'cat': 'CAT',
                    'other': 'OTHER'
                };
                const species = speciesMap[petData.type];

                const registerRequest = {
                    species: species, // 등록 시에만 species 전송
                    name: petData.name,
                    mainBreedId: hasMainBreedId ? petData.mainBreedId : null,
                    customMainBreedName: (!hasMainBreedId && hasCustomBreed) ? petData.customBreed : null,
                    subBreedId: hasMainBreedId ? (petData.subBreedId || null) : null,
                    gender: petData.gender === '남아' ? 'MALE' : petData.gender === '여아' ? 'FEMALE' : 'UNKNOWN',
                    birthday: petData.dob,
                    isNeutered: petData.isNeutered || false,
                    hasMicrochip: petData.hasMicrochip || false,
                    registrationNum: petData.registrationNumber ? Number(petData.registrationNumber) : null,
                    profileImg: petData.imageFile || null,
                    registerPdf: petData.registrationFile || null,
                };
                // 새 펫 등록
                await petApi.registerPet(registerRequest);
                showAlert('새로운 펫이 등록되었습니다!');
            } else {
                // 펫 정보 수정
                if (!currentPet?.id) {
                    showAlert('수정할 펫 정보를 찾을 수 없습니다.');
                    return;
                }

                const updateRequest = {
                    name: petData.name,
                    mainBreedId: hasMainBreedId ? petData.mainBreedId : null,
                    customMainBreedName: (!hasMainBreedId && hasCustomBreed) ? petData.customBreed : null,
                    subBreedId: hasMainBreedId ? (petData.subBreedId || null) : null,
                    gender: petData.gender === '남아' ? 'MALE' : petData.gender === '여아' ? 'FEMALE' : 'UNKNOWN',
                    birthday: petData.dob,
                    isNeutered: petData.isNeutered || false,
                    hasMicrochip: petData.hasMicrochip || false,
                    registrationNum: petData.registrationNumber ? Number(petData.registrationNumber) : null,
                    profileImg: petData.imageFile || null,
                    registerPdf: petData.registrationFile || null,
                    deleteProfileImg: petData.deleteProfileImg,
                    deleteRegistrationPdf: petData.deleteRegistrationPdf,
                };

                await petApi.updatePet(currentPet.id, updateRequest);
                showAlert(`${petData.name}의 정보가 수정되었습니다.`);
            }

            // 목록 새로고침
            await loadPets();
            setIsModalOpen(false);
        } catch (error) {
            const errorMessage = handleApiError(error);
            showAlert(`펫 저장에 실패했습니다: ${errorMessage}`);
            console.error('Failed to save pet:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (petToDeleteId !== null) {
            try {
                setIsLoading(true);
                await petApi.deletePet(petToDeleteId);
                showAlert('펫 정보가 삭제되었습니다.');

                // 목록 새로고침
                await loadPets();
            } catch (error) {
                const errorMessage = handleApiError(error);
                showAlert(`펫 삭제에 실패했습니다: ${errorMessage}`);
                console.error('Failed to delete pet:', error);
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
                    disabled={isLoading}
                    className="bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-2xl hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <i className="fas fa-plus mr-2"></i>새 펫 등록
                </button>
            </header>
            <main>
                {isLoading ? (
                    <div className="text-center py-20 bg-white rounded-lg shadow-md">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                        <p className="text-gray-500 mt-4">로딩 중...</p>
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