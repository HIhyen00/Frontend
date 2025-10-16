import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../../pet-walk/utils/axiosConfig';
import type { Pet } from '../types/types';
import MissionCalendar from './MissionCalendar'; // 캘린더 컴포넌트 import

// 백엔드 DTO와 맞춘 타입들
interface DailyMission {
    id: number;
    name: string;
    description: string;
}

interface MissionCompletion {
    completionId: number;
    missionId: number;
    missionName: string;
    completedDate: string;
}

interface MissionStatsResponse {
    totalCompletions: number;
}

interface DailyMissionTabProps {
    petData: Pet; // 현재 유저 정보를 가져오기 위해 petData를 활용 (추후 user 전용 데이터로 변경될 수 있음)
}

const DailyMissionTab: React.FC<DailyMissionTabProps> = ({ petData }) => {
    const [missions, setMissions] = useState<DailyMission[]>([]);
    const [completions, setCompletions] = useState<Set<number>>(new Set());
    const [totalCompletions, setTotalCompletions] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    // userId를 petData에서 임시로 가져옵니다. 실제로는 로그인된 사용자 ID를 사용해야 합니다.
    const userId = petData.userId || 1;

    const fetchMissionsAndCompletions = useCallback(async () => {
        // setIsLoading(true); // 깜빡임 방지를 위해 리프레시 시에는 로딩 상태를 변경하지 않음
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;

            // API 호출들을 병렬로 처리하여 성능 향상
            const [missionsData, historyData, statsData] = await Promise.all([
                apiClient.get<DailyMission[]>('/api/missions'),
                apiClient.get<MissionCompletion[]>(`/api/users/${userId}/missions/history`, { params: { year, month } }),
                apiClient.get<MissionStatsResponse>(`/api/users/${userId}/missions/stats`)
            ]);

            // 1. 전체 미션 목록 설정
            setMissions(missionsData);

            // 2. 오늘 완료한 미션 기록 설정
            const todaysCompletions = new Set(
                historyData
                    .filter(h => h.completedDate === today.toISOString().slice(0, 10))
                    .map(h => h.missionId)
            );
            setCompletions(todaysCompletions);

            // 3. 전체 미션 완료 횟수 설정
            setTotalCompletions(statsData.totalCompletions);

        } catch (error) {
            console.error("미션 정보를 가져오는데 실패했습니다.", error);
        } finally {
            setIsLoading(false);
        }
    }, [userId]);

    useEffect(() => {
        fetchMissionsAndCompletions();
    }, [fetchMissionsAndCompletions]);

    const handleToggleCompletion = async (missionId: number) => {
        const wasCompleted = completions.has(missionId);
        // UI 즉시 업데이트 (Optimistic UI)
        const newCompletions = new Set(completions);
        if (wasCompleted) {
            newCompletions.delete(missionId);
        } else {
            newCompletions.add(missionId);
        }
        setCompletions(newCompletions);

        try {
            if (wasCompleted) {
                await apiClient.delete(`/api/users/${userId}/missions/${missionId}/completions`);
            } else {
                await apiClient.post(`/api/users/${userId}/missions/${missionId}/completions`);
            }
            // 데이터 일관성을 위해 모든 정보를 다시 불러옴
            await fetchMissionsAndCompletions();
        } catch (error) {
            console.error("미션 상태 변경에 실패했습니다.", error);
            // 실패 시 UI 롤백
            setCompletions(completions);
        }
    };

    const level = Math.floor(totalCompletions / 5);
    const title = level > 0 ? `Lv.${level} 달성!` : '초보 탐험가';

    if (isLoading) {
        return <div className="text-center p-6">미션 목록을 불러오는 중...</div>;
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
            <div className="text-center mb-8">
                <div className="inline-block bg-purple-100 text-purple-700 font-bold py-2 px-4 rounded-full text-lg shadow-sm">
                    {title}
                </div>
                <p className="text-md text-gray-500 mt-2">총 {totalCompletions}개의 미션을 완료했어요!</p>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4">오늘의 미션</h3>
            <p className="text-sm text-gray-500 mb-6">매일매일 미션을 완료하고 건강한 습관을 만들어보세요!</p>
            
            <div className="space-y-3">
                {missions.map(mission => (
                    <div 
                        key={mission.id}
                        onClick={() => handleToggleCompletion(mission.id)}
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${completions.has(mission.id) ? 'bg-green-100 border-green-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
                        <div className="flex-shrink-0">
                            <input
                                type="checkbox"
                                checked={completions.has(mission.id)}
                                readOnly
                                className="h-6 w-6 rounded-full text-green-500 focus:ring-0 cursor-pointer"
                            />
                        </div>
                        <div className="ml-4">
                            <p className={`font-semibold ${completions.has(mission.id) ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                {mission.name}
                            </p>
                            <p className="text-sm text-gray-500">{mission.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            <MissionCalendar userId={userId} />
        </div>
    );
};

export default DailyMissionTab;
