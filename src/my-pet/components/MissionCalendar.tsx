import { useState, useEffect, useMemo } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { apiHelper } from '../utils/axiosConfig';

interface MissionCompletion {
    completionId: number;
    missionId: number;
    missionName: string;
    completedDate: string;
}

interface MissionCalendarProps {
    userId: number;
}

const MissionCalendar: React.FC<MissionCalendarProps> = ({ userId }) => {
    const [activeDate, setActiveDate] = useState(new Date());
    const [completions, setCompletions] = useState<MissionCompletion[]>([]);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const year = activeDate.getFullYear();
                const month = activeDate.getMonth() + 1;
                const data = await apiHelper.get<MissionCompletion[]>(`/users/${userId}/missions/history`, { year, month });
                setCompletions(data);
            } catch (error) {
                console.error("Failed to fetch mission history", error);
            }
        };

        if (userId) {
            fetchHistory();
        }
    }, [userId, activeDate]);

    const completionsByDate = useMemo(() => {
        const map = new Map<string, MissionCompletion[]>();
        completions.forEach(comp => {
            const date = comp.completedDate;
            if (!map.has(date)) {
                map.set(date, []);
            }
            map.get(date)!.push(comp);
        });
        return map;
    }, [completions]);

    const tileContent = ({ date, view }: { date: Date, view: string }) => {
        if (view === 'month') {
            const dateString = date.toISOString().slice(0, 10);
            if (completionsByDate.has(dateString)) {
                const count = completionsByDate.get(dateString)!.length;
                return (
                    <div className="flex justify-center items-center mt-1">
                        <div className="h-5 w-5 flex items-center justify-center rounded-full bg-green-500 text-white text-xs font-bold">{count}</div>
                    </div>
                );
            }
        }
        return null;
    };

    return (
        <div className="mt-8">
            <h3 className="text-xl font-bold text-gray-800 mb-4">미션 달성 캘린더</h3>
            <div className="p-4 bg-gray-50 rounded-lg shadow-inner">
                 <Calendar
                    onChange={(value) => setActiveDate(value as Date)} 
                    value={activeDate}
                    onActiveStartDateChange={({ activeStartDate }) => setActiveDate(activeStartDate || new Date())}
                    tileContent={tileContent}
                    className="border-none w-full"
                    formatDay={(_, date) => date.getDate().toString()} // '일' 제거
                />
            </div>
        </div>
    );
};

export default MissionCalendar;
