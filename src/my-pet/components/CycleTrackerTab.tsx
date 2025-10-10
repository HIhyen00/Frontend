import { useState, useMemo, useEffect, useCallback } from "react";
import type { Pet } from "../types/types.ts";
import Calendar from "react-calendar";
import 'react-calendar/dist/Calendar.css';
import { apiClient } from "../../pet-walk/utils/axiosConfig.ts";

// 백엔드 DTO와 일치하는 타입 정의
interface PetCycle {
    id: number;
    petId: number;
    startDate: string;
    endDate: string | null;
    memo: string | null;
}

interface CycleTrackerTabProps {
    petData: Pet;
    onUpdate?: (updatedPet: Pet) => void;
}

const addDays = (date: Date, days: number): Date => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
};

const formatDate = (date: Date | string): string => {
    if (typeof date === 'string') {
        return date.slice(0, 10);
    }
    return date.toISOString().slice(0, 10);
};

const CycleTrackerTab: React.FC<CycleTrackerTabProps> = ({ petData }) => {
    const [cycles, setCycles] = useState<PetCycle[]>([]);
    const [startDate, setStartDate] = useState<string>(formatDate(new Date()));
    const [endDate, setEndDate] = useState<string>("");
    const [memo, setMemo] = useState<string>("");
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const fetchCycles = useCallback(async () => {
        if (!petData?.id) return;
        setIsLoading(true);
        try {
            const data = await apiClient.get<PetCycle[]>(`/pets/${petData.id}/cycles`);
            setCycles(data);
        } catch (error) {
            console.error("Failed to fetch cycles", error);
        } finally {
            setIsLoading(false);
        }
    }, [petData?.id]);

    useEffect(() => {
        fetchCycles();
    }, [fetchCycles]);

    const cycleInfo = useMemo(() => {
        if (!cycles || cycles.length === 0) {
            return null;
        }

        const sortedCycles = [...cycles].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        const lastCycle = sortedCycles[0];
        const lastStartDate = new Date(lastCycle.startDate);

        const avgCycleDays = petData.type === 'dog' ? 180 : 21;
        const heatDuration = petData.type === 'dog' ? 10 : 7;
        const pregnancyDuration = 63;

        const nextHeatDate = addDays(lastStartDate, avgCycleDays);
        const estimatedDueDate = addDays(lastStartDate, pregnancyDuration);

        return {
            lastStartDate,
            nextHeatDate,
            estimatedDueDate,
            heatDuration,
            daysUntilNextCycle: Math.round((nextHeatDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
        };
    }, [cycles, petData.type]);

    const handleAddCycle = async () => {
        if (!startDate || !petData?.id) return;
        
        const newCycle = {
            startDate,
            endDate: endDate || null,
            memo: memo || null,
        };

        try {
            await apiClient.post(`/pets/${petData.id}/cycles`, newCycle);
            // 성공 후 입력 필드 초기화 및 목록 새로고침
            setStartDate(formatDate(new Date()));
            setEndDate("");
            setMemo("");
            fetchCycles();
        } catch (error) {
            console.error("Failed to add cycle", error);
        }
    };

    const handleDeleteCycle = async (cycleId: number) => {
        if (!petData?.id) return;
        try {
            await apiClient.delete(`/pets/${petData.id}/cycles/${cycleId}`);
            fetchCycles(); // 삭제 후 목록 새로고침
        } catch (error) {
            console.error("Failed to delete cycle", error);
        }
    };

    const tileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month' && cycleInfo) {
            const day = formatDate(date);

            for (const cycle of cycles) {
                const start = new Date(cycle.startDate);
                const end = cycle.endDate ? new Date(cycle.endDate) : addDays(start, cycleInfo.heatDuration);
                if (date >= start && date <= end) {
                    return <div className="h-2 w-2 bg-pink-400 rounded-full mx-auto mt-1" title="생리 기간"></div>;
                }
            }

            if (day === formatDate(cycleInfo.nextHeatDate)) {
                return <div className="h-2 w-2 bg-blue-400 rounded-full mx-auto mt-1" title="다음 예정일"></div>;
            }
        }
        return null;
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg p-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl font-bold text-gray-800 mb-4">주기 정보 및 기록</h3>
                    <div className="bg-indigo-50 p-4 rounded-lg mb-6">
                        {cycleInfo && cycleInfo.daysUntilNextCycle > 0 ? (
                            <>
                                <p className="font-semibold text-indigo-800">다음 예정일</p>
                                <p className="text-3xl font-bold text-indigo-600">{formatDate(cycleInfo.nextHeatDate)}</p>
                                <p className="text-sm text-indigo-500">{cycleInfo.daysUntilNextCycle}일 남음 (3일 전 알림 예정)</p>
                            </>
                        ) : (
                            <p className="text-gray-500">기록을 추가하면 다음 예정일을 예측해 드려요.</p>
                        )}
                    </div>

                    <div className="space-y-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div className="flex-1">
                                <label htmlFor="heat-start" className="font-semibold text-gray-700 text-sm">시작일</label>
                                <input type="date" id="heat-start" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                            </div>
                            <div className="flex-1">
                                <label htmlFor="heat-end" className="font-semibold text-gray-700 text-sm">종료일 (선택)</label>
                                <input type="date" id="heat-end" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                            </div>
                        </div>
                        <div>
                            <label htmlFor="memo" className="font-semibold text-gray-700 text-sm">메모 (선택)</label>
                            <input type="text" id="memo" value={memo} onChange={(e) => setMemo(e.target.value)} placeholder="특이사항을 기록하세요" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"/>
                        </div>
                        <button onClick={handleAddCycle} className="w-full py-2 px-4 bg-indigo-500 text-white font-semibold rounded-lg hover:bg-indigo-600 transition">
                            기록 추가
                        </button>
                    </div>

                    <div className="space-y-2">
                        <h4 className="font-semibold text-gray-700">기록 목록</h4>
                        <div className="max-h-40 overflow-y-auto pr-2">
                            {isLoading ? <p>로딩 중...</p> : cycles.length > 0 ? (
                                cycles.map(cycle => (
                                    <div key={cycle.id} className="flex justify-between items-center p-2 bg-gray-50 rounded-lg">
                                        <span>{cycle.startDate} ~ {cycle.endDate || '...'}</span>
                                        <button onClick={() => handleDeleteCycle(cycle.id)} className="text-red-400 hover:text-red-600">
                                            <i className="fas fa-trash-alt"></i>
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-gray-400">기록이 없어요.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col items-center">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">주기 달력</h3>
                    <Calendar tileContent={tileContent} className="border-none shadow-md rounded-lg p-2"/>
                    <div className="flex gap-4 mt-4 text-sm">
                        <div className="flex items-center gap-2"><div className="h-3 w-3 bg-pink-400 rounded-full"></div> 생리 기간</div>
                        <div className="flex items-center gap-2"><div className="h-3 w-3 bg-blue-400 rounded-full"></div> 다음 예정일</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CycleTrackerTab;

