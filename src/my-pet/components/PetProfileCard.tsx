import { useState, useMemo } from 'react';
import type {Pet} from '../types/types.ts';
import { useNavigate } from 'react-router-dom';
import { getDefaultImageUrl } from '../utils/petUtils.ts';

interface PetProfileCardProps {
    pet: Pet;
    onEdit: (pet: Pet) => void;
    onOpenConfirm: (id: number) => void;
    onOpenRegistration: (registrationUrl: string) => void;
    onShowAlert: (message: string) => void;
    onToggleMission: (petId: number, task: string) => void;
    onRerollMissions: (petId: number) => void;
}

const PetProfileCard: React.FC<PetProfileCardProps> = ({ pet, onEdit, onOpenConfirm, onOpenRegistration, onToggleMission, onRerollMissions }) => {
    const navigate = useNavigate();

    // 미션 목록을 보여줄지 말지 결정하는 상태
    const [showMissions, setShowMissions] = useState(false);

    // 데일리 미션 진행도를 계산하는 로직
    const missionProgress = useMemo(() => {
        const totalMissions = pet.dailyMission.length;
        if (totalMissions === 0) return 0; // 미션이 없으면 0%
        const completedMissions = pet.dailyMission.filter(m => m.done).length;
        return Math.round((completedMissions / totalMissions) * 100);
    }, [pet.dailyMission]);

    // 프로필 이미지 로딩에 실패했을 때, 기본 이미지로 바꿔주는 함수
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.src = getDefaultImageUrl(pet.type);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl">
            <div className="p-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="relative flex-shrink-0">
                        <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-indigo-200 bg-gray-100 flex items-center justify-center">
                            <img
                                className="h-full w-full object-cover"
                                src={pet.imageUrl || '/default-pet-image.png'}
                                alt={`${pet.name}의 프로필 사진`}
                                onError={handleImageError}
                            />
                        </div>
                        {/* 마이크로칩, 중성화 아이콘 */}
                        {pet.hasMicrochip && (
                            <div className="absolute top-2 left-2 bg-sky-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md" title="마이크로칩 등록됨">
                                <i className="fas fa-microchip"></i>
                            </div>
                        )}
                        {pet.isNeutered && (
                            <div className="absolute top-2 right-2 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center shadow-md" title="중성화 완료">
                                <i className="fas fa-heart-crack"></i>
                            </div>
                        )}
                    </div>

                    {/* 오른쪽: 펫의 상세 정보 */}
                    <div className="flex-grow w-full text-center md:text-left">
                        {/* 펫 타입(DOG/CAT/OTHER)과 품종 */}
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                            {pet.type === 'dog' ? (
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                                    <i className="fas fa-dog mr-1"></i>DOG
                                </span>
                            ) : pet.type === 'cat' ? (
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-orange-600 bg-orange-200">
                                    <i className="fas fa-cat mr-1"></i>CAT
                                </span>
                            ) : (
                                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-gray-600 bg-gray-200">
                                    <i className="fas fa-paw mr-1"></i>OTHER
                                </span>
                            )}
                            <p className="text-lg text-gray-600 font-medium">{pet.mainBreed}</p>
                        </div>

                        {/* 이름, 성별, 및 수정/삭제 버튼 */}
                        <div className="flex items-baseline justify-center md:justify-start gap-4">
                            <p className="text-3xl font-bold text-gray-800">{pet.name} <span className="text-xl font-medium text-gray-500">({pet.gender})</span></p>
                            <div className="space-x-1">
                                <button onClick={() => onEdit(pet)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><i className="fas fa-pen text-sm"></i></button>
                                <button onClick={() => onOpenConfirm(pet.id)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-red-500 transition"><i className="fas fa-trash text-sm"></i></button>
                                <button onClick={() => onOpenRegistration(pet.registrationUrl)} className="p-2 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"><i className="fas fa-file text-sm"></i></button>
                            </div>
                        </div>

                        {/* 생일과 케이크 아이콘 */}
                        <div className="flex items-center justify-center md:justify-start gap-2 text-md text-gray-500 mt-1">
                            <i className="fas fa-birthday-cake"></i>
                            <span>{pet.dob}</span>
                        </div>

                        {/* 데일리 미션 진행도 바 */}
                        <div className="mt-4">
                            <label className="text-sm font-medium text-gray-600">오늘의 미션 달성도</label>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                                <div className="bg-gradient-to-r from-green-400 to-blue-500 h-2.5 rounded-full" style={{ width: `${missionProgress}%` }}></div>
                            </div>
                            <p className="text-right text-sm text-gray-500 mt-1">{missionProgress}% 완료</p>
                        </div>
                    </div>
                </div>

                {/* 데일리 미션 목록 */}
                {showMissions && (
                    <div className="mt-4 pt-4 border-t border-gray-200 animate-fade-in">
                        <div className="flex justify-between items-center mb-2">
                            <h4 className="font-semibold text-gray-700">오늘의 미션 목록</h4>
                            <button
                                onClick={() => onRerollMissions(pet.id)}
                                disabled={pet.hasRerolledToday} // 새로고침 했으면 버튼 비활성화
                                className="py-1 px-3 text-xs font-semibold rounded-full transition text-white bg-indigo-400 hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                <i className="fas fa-sync-alt mr-1"></i>
                                {pet.hasRerolledToday ? '사용완료' : '새로고침'}
                            </button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                            {pet.dailyMission.map((mission) => (
                                <div
                                    key={mission.task}
                                    className="flex items-center p-2 rounded-lg transition hover:bg-gray-50 cursor-pointer"
                                    onClick={() => onToggleMission(pet.id, mission.task)}
                                >
                                    <input type="checkbox" checked={mission.done} readOnly className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"/>
                                    <label className={`ml-3 text-gray-700 select-none ${mission.done ? 'line-through text-gray-400' : ''}`}>
                                        {mission.task}
                                    </label>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 하단 기능 아이콘 메뉴 */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-around">
                    <div className="flex flex-col items-center cursor-pointer text-center w-20" onClick={() => navigate(`/memories/${pet.id}`)}>
                        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center text-blue-500 text-2xl mb-2"><i className="fa-solid fa-book-medical"></i></div>
                        <span className="text-sm text-gray-600">건강 기록</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer text-center w-20" onClick={() => navigate(`/medical-record/${pet.id}`)}>
                        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center text-green-500 text-2xl mb-2"><i className="fa-solid fa-stethoscope"></i></div>
                        <span className="text-sm text-gray-600">진료/접종</span>
                    </div>
                    {/* 건강리포트 */}
                    <div className="flex flex-col items-center cursor-pointer text-center w-20" onClick={() => navigate(`/health-report/${pet.id}`)}>
                        <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center text-pink-500 text-2xl mb-2"><i className="fa-solid fa-heart-pulse"></i></div>
                        <span className="text-sm text-gray-600">건강 리포트</span>
                    </div>
                    <div className="flex flex-col items-center cursor-pointer text-center w-20" onClick={() => setShowMissions(!showMissions)}>
                        <div className="w-14 h-14 bg-yellow-100 rounded-full flex items-center justify-center text-yellow-500 text-2xl mb-2"><i className="fa-solid fa-bone"></i></div>
                        <span className="text-sm text-gray-600">데일리 미션</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PetProfileCard;

