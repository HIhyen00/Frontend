import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import type {Pet} from "../../types/types.ts";
import { petApi, convertResponseToPet, handleApiError } from "../../utils/petApi.ts";
import { useAuth } from "../../../account/hooks/useAuth";


const MemoriesPage: React.FC = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { petId } = useParams<{ petId: string }>();

    const [petData, setPetData] = useState<Pet | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // 로그인 검증 - authLoading이 끝난 후에만 체크
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            navigate('/login', { state: { message: '로그인이 필요한 서비스입니다.' } });
        }
    }, [isAuthenticated, authLoading, navigate]);

    useEffect(() => {
        const loadPetData = async () => {
            if (!petId || !isAuthenticated) {
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
    }, [petId, isAuthenticated]);

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
                        <p className="text-lg text-gray-500">추억 기록</p>
                    </div>
                </header>

                <main>
                    <div className="bg-white rounded-lg shadow-md p-12 text-center">
                        <div className="flex flex-col items-center justify-center space-y-4">
                            <i className="fas fa-tools text-6xl text-gray-300"></i>
                            <h2 className="text-2xl font-bold text-gray-700">서비스 준비중입니다..</h2>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default MemoriesPage;