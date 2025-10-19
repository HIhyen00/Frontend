import { useState, useEffect, useCallback } from 'react';
import { apiHelper } from '../utils/axiosConfig';
import type { Pet } from '../types/types';
import MissionCalendar from './MissionCalendar'; // 캘린더 컴포넌트 import

// 미션 풀 정의 (API 호출 실패 시 사용)
const MISSION_POOL = {
    dog: [
        { name: '공원에서 산책 30분', description: '신선한 공기를 마시며 운동해요' },
        { name: '새로운 강아지 친구 사귀기', description: '사회성을 길러요' },
        { name: '간식 숨겨놓고 노즈워크', description: '후각 훈련으로 두뇌 발달' },
        { name: '양치질 깨끗하게 하기', description: '구강 건강 관리' },
        { name: '산책 후 발 닦기', description: '위생 관리' },
        { name: '빗질 5분 이상', description: '털 관리와 피부 마사지' },
        { name: '기본 훈련 복습', description: '앉아, 기다려 명령어 연습' },
        { name: '새 장난감 가지고 놀기', description: '스트레스 해소' },
        { name: '주인과 교감하기', description: '쓰다듬으며 유대감 형성' },
        { name: '사료 남기지 않고 다 먹기', description: '건강한 식습관' },
    ],
    cat: [
        { name: '스크래쳐 신나게 긁기', description: '발톱 관리와 스트레스 해소' },
        { name: '사냥 놀이 15분', description: '본능 자극 놀이' },
        { name: '캣타워 꼭대기 정복', description: '운동과 영역 확인' },
        { name: '창밖 새 구경하기', description: '시각 자극' },
        { name: '츄르 맛있게 먹기', description: '수분 보충' },
        { name: '정성껏 그루밍하기', description: '청결 유지' },
        { name: '주인 무릎에서 잠자기', description: '애정 표현' },
        { name: '새로운 숨숨집 탐험', description: '호기심 충족' },
        { name: '깃털 장난감으로 놀기', description: '사냥 본능 자극' },
        { name: '물 많이 마시기', description: '수분 섭취' },
    ],
    other: [
        { name: '쳇바퀴 30분 타기', description: '충분한 운동' },
        { name: '해바라기씨 까먹기', description: '영양 섭취' },
        { name: '새로운 노래 배우기', description: '지능 발달' },
        { name: '따뜻한 물에 몸 담그기', description: '피부 건강' },
        { name: '은신처에서 꿀잠자기', description: '안정감 제공' },
        { name: '신선한 야채 먹기', description: '건강한 식단' },
        { name: '주인과 핸들링 5분', description: '친밀도 상승' },
        { name: '케이지 탐험하기', description: '활동량 증가' },
        { name: '햄스터 모래목욕하기', description: '청결 유지' },
        { name: '작은 공 굴리기 놀이', description: '놀이 시간' },
    ]
};

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
    const [useLocalMode, setUseLocalMode] = useState(false);

    // userId를 petData에서 임시로 가져옵니다. 실제로는 로그인된 사용자 ID를 사용해야 합니다.
    const userId = petData.userId;

    const localCompletionsKey = `local_completions_pet_${petData.id}`;
    const localStatsKey = `local_stats_pet_${petData.id}`;

    const generateLocalMissions = useCallback((petType: 'dog' | 'cat' | 'other'): DailyMission[] => {
        const pool = MISSION_POOL[petType];
        const missionCount = Math.min(5, pool.length);
        const shuffled = [...pool].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, missionCount).map((mission, index) => ({
            id: index + 1,
            ...mission
        }));
    }, []);

    const loadLocalCompletions = useCallback(() => {
        const today = new Date().toISOString().slice(0, 10);
        const savedCompletions = localStorage.getItem(localCompletionsKey);

        if (savedCompletions) {
            const records = JSON.parse(savedCompletions);
            const todayRecord = records.find((r: any) => r.date === today);
            if (todayRecord) {
                setCompletions(new Set(todayRecord.completedMissions));
            }
        }

        // 전체 통계 로드
        const savedStats = localStorage.getItem(localStatsKey);
        if (savedStats) {
            const stats = JSON.parse(savedStats);
            setTotalCompletions(stats.totalCompletions || 0);
        }
    }, [localCompletionsKey, localStatsKey]);

    const saveLocalCompletion = useCallback((missionId: number, isCompleting: boolean) => {
        const today = new Date().toISOString().slice(0, 10);
        const savedCompletions = localStorage.getItem(localCompletionsKey);
        let records = savedCompletions ? JSON.parse(savedCompletions) : [];

        const todayIndex = records.findIndex((r: any) => r.date === today);
        const newCompletions = new Set(completions);

        if (isCompleting) {
            newCompletions.add(missionId);
        } else {
            newCompletions.delete(missionId);
        }

        if (todayIndex >= 0) {
            records[todayIndex].completedMissions = Array.from(newCompletions);
        } else {
            records.push({
                date: today,
                completedMissions: Array.from(newCompletions)
            });
        }

        localStorage.setItem(localCompletionsKey, JSON.stringify(records));

        // 전체 통계 업데이트
        const totalCount = records.reduce((sum: number, record: any) =>
            sum + record.completedMissions.length, 0);
        localStorage.setItem(localStatsKey, JSON.stringify({ totalCompletions: totalCount }));
        setTotalCompletions(totalCount);
    }, [completions, localCompletionsKey, localStatsKey]);

    const fetchMissionsAndCompletions = useCallback(async () => {
        // setIsLoading(true); // 깜빡임 방지를 위해 리프레시 시에는 로딩 상태를 변경하지 않음
        try {
            const today = new Date();
            const year = today.getFullYear();
            const month = today.getMonth() + 1;

            // API 호출들을 병렬로 처리하여 성능 향상
            const [missionsData, historyData, statsData] = await Promise.all([
                apiHelper.get<DailyMission[]>('/users/missions'),
                apiHelper.get<MissionCompletion[]>(`/users/${userId}/missions/history`, { params: { year, month } }),
                apiHelper.get<MissionStatsResponse>(`/users/${userId}/missions/stats`)
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

            setUseLocalMode(false);

        } catch (error) {
            console.error("미션 정보를 가져오는데 실패했습니다.", error);
            setUseLocalMode(true);
            const localMissions = generateLocalMissions(petData.type);
            setMissions(localMissions);
            loadLocalCompletions();
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

        if (useLocalMode) {
            saveLocalCompletion(missionId, !wasCompleted);
            return;
        }

        try {
            if (wasCompleted) {
                await apiHelper.delete(`/users/${userId}/missions/${missionId}/completions`);
            } else {
                await apiHelper.post(`/users/${userId}/missions/${missionId}/completions`);
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
                <div className="inline-block bg-blue-100 text-blue-700 font-bold py-2 px-4 rounded-full text-lg shadow-sm">
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
                        className={`flex items-center p-4 rounded-lg cursor-pointer transition-all duration-200 ${completions.has(mission.id) ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 hover:bg-gray-100'}`}>
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
