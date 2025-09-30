import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {Pet} from "../../types/types.ts";

import MedicalRecordTab from "../../components/MedicalRecordTab.tsx";
import VaccinationHistoryTab from "../../components/VaccinationHistoryTab.tsx";

const HealthReportPage: React.FC = () => {
    const navigate = useNavigate();
    const { petId } = useParams<{ petId: string }>();

    const [petData, setPetData] = useState<Pet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'vac' | 'record'>('vac');

    useEffect(() => {
        if (petId) {
            const savedPetsData = localStorage.getItem('myPetsData');
            if (savedPetsData) {
                const allPets: Pet[] = JSON.parse(savedPetsData);
                const currentPet = allPets.find(p => p.id === parseInt(petId));

                if (currentPet) {
                    // 데이터 마이그레이션: Pet 데이터에 최신 필드가 없을 경우 기본값을 설정합니다.
                    const migratedPet: Pet = {
                        ...currentPet,
                        aiReports: Array.isArray(currentPet.aiReports) ? currentPet.aiReports : [],
                    };
                    setPetData(migratedPet);
                }
            }
        }
        setIsLoading(false);
    }, [petId]);

    const handleUpdatePetData = (updatedPet: Pet) => {
        setPetData(updatedPet);

        const savedPetsData = localStorage.getItem('myPetsData');
        if (savedPetsData) {
            let allPets: Pet[] = JSON.parse(savedPetsData);
            allPets = allPets.map(p => p.id === updatedPet.id ? updatedPet : p);
            localStorage.setItem('myPetsData', JSON.stringify(allPets));
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">데이터를 불러오는 중...</div>;
    }

    if (!petData) {
        return (
            <div className="p-8 text-center">
                <h2 className="text-2xl font-bold">펫 정보를 찾을 수 없어요.</h2>
                <button onClick={() => navigate('/my-pet')} className="mt-4 px-4 py-2 bg-indigo-500 text-white rounded-lg">
                    나의 펫 목록으로 돌아가기
                </button>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 relative overflow-hidden p-4 sm:p-8 z-0">
            <div className="h-16 w-full"></div>
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center gap-6 mb-8">
                    <button onClick={() => navigate('/my-pet')} className="text-gray-500 hover:text-gray-800">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </button>
                    <img src={petData.imageUrl} alt={petData.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">{petData.name}</h1>
                        <p className="text-lg text-gray-500">진료 / 접종 내역</p>
                    </div>
                </header>

                <nav className="flex border-b-2 border-gray-200 mb-6">
                    <button onClick={() => setActiveTab('vac')} className={`py-3 px-6 font-semibold transition ${activeTab === 'vac' ? 'border-b-4 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>접종 이력</button>
                    <button onClick={() => setActiveTab('record')} className={`py-3 px-6 font-semibold transition ${activeTab === 'record' ? 'border-b-4 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>진료기록</button>
                </nav>

                <main>
                    {activeTab === 'vac' && <VaccinationHistoryTab pet={petData} onUpdatePet={handleUpdatePetData} />}
                    {activeTab === 'record' && <MedicalRecordTab petData={petData} onUpdate={handleUpdatePetData} />}
                </main>
            </div>
        </div>
    );
};

export default HealthReportPage;