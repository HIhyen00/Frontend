import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Pet } from '../../types/types.ts';
import DailyMissionTab from '../../components/DailyMissionTab.tsx';

const MissionPage: React.FC = () => {
    const navigate = useNavigate();
    const { petId } = useParams<{ petId: string }>();
    const [petData, setPetData] = useState<Pet | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (petId) {
            const savedPetsData = localStorage.getItem('myPetsData');
            if (savedPetsData) {
                const allPets: Pet[] = JSON.parse(savedPetsData);
                const currentPet = allPets.find(p => p.id === parseInt(petId));
                setPetData(currentPet || null);
            }
        }
        setIsLoading(false);
    }, [petId]);

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
        <div className="bg-gray-50 min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex items-center gap-6 mb-8">
                    <button onClick={() => navigate('/my-pet')} className="text-gray-500 hover:text-gray-800">
                        <i className="fas fa-arrow-left text-2xl"></i>
                    </button>
                    <img src={petData.imageUrl} alt={petData.name} className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md" />
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">{petData.name}</h1>
                        <p className="text-lg text-gray-500">데일리 미션</p>
                    </div>
                </header>
                <main>
                    <DailyMissionTab petData={petData} />
                </main>
            </div>
        </div>
    );
};

export default MissionPage;
