import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {Pet} from "../../types/types.ts";
import { petApi, convertResponseToPet, handleApiError } from "../../utils/petApi.ts";

import AIReportTab from "../../components/AIReportTab.tsx";
import CycleTrackerTab from "../../components/CycleTrackerTab.tsx";
import WeightLogTab from "../../components/WeighLogTab.tsx";

const HealthReportPage: React.FC = () => {
    const navigate = useNavigate();
    const { petId } = useParams<{ petId: string }>();

    const [petData, setPetData] = useState<Pet | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'ai' | 'cycle' | 'weight'>('ai');

    useEffect(() => {
        const loadPetData = async () => {
            if (!petId) {
                setIsLoading(false);
                return;
            }

            try {
                setIsLoading(true);
                // API로 펫 정보 조회
                const petResponse = await petApi.getPet(parseInt(petId));
                const convertedPet = convertResponseToPet(petResponse);
                setPetData(convertedPet);
            } catch (error) {
                const errorMessage = handleApiError(error);
                console.error('펫 정보 로딩 실패:', errorMessage);
                setPetData(null);
            } finally {
                setIsLoading(false);
            }
        };

        loadPetData();
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
        return (
            <div className="flex items-center justify-center min-h-screen p-8">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                    <p className="text-gray-500 mt-4">데이터를 불러오는 중...</p>
                </div>
            </div>
        );
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
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="h-16 w-full"></div>
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center gap-6 mb-8">
                    <button onClick={() => navigate('/my-pet')} className="text-gray-500 hover:text-gray-800">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </button>
                    <img src={petData.imageUrl} alt={petData.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">{petData.name}</h1>
                        <p className="text-lg text-gray-500">건강 리포트</p>
                    </div>
                </header>

                <nav className="flex border-b-2 border-gray-200 mb-6">
                    <button onClick={() => setActiveTab('ai')} className={`py-3 px-6 font-semibold transition ${activeTab === 'ai' ? 'border-b-4 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>AI 리포트</button>
                    <button onClick={() => setActiveTab('weight')} className={`py-3 px-6 font-semibold transition ${activeTab === 'weight' ? 'border-b-4 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>체중/활동량</button>
                    {(petData.type === 'dog' || petData.type === 'cat') && petData.gender === '여아' && (
                        <button onClick={() => setActiveTab('cycle')} className={`py-3 px-6 font-semibold transition ${activeTab === 'cycle' ? 'border-b-4 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-800'}`}>생리주기</button>
                    )}
                </nav>

                <main>
                    {activeTab === 'ai' && <AIReportTab pet={petData} onUpdatePet={handleUpdatePetData} />}
                    {activeTab === 'weight' && <WeightLogTab petData={petData} onUpdate={handleUpdatePetData} />}
                    {activeTab === 'cycle' && <CycleTrackerTab petData={petData} onUpdate={handleUpdatePetData} />}
                </main>
            </div>
        </div>
    );
};

export default HealthReportPage;