import React from 'react';
import { FaMapMarkerAlt } from 'react-icons/fa';

interface RouteModalProps {
    show: boolean;
    routeName: string;
    routeDescription: string;
    routePoints: { lat: number; lng: number }[];
    saving: boolean;
    onRouteName: (name: string) => void;
    onRouteDescription: (desc: string) => void;
    onSave: () => void;
    onCancel: () => void;
}

const RouteModal: React.FC<RouteModalProps> = ({
    show,
    routeName,
    routeDescription,
    routePoints,
    saving,
    onRouteName,
    onRouteDescription,
    onSave,
    onCancel,
}) => {
    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md" onClick={onCancel}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 border border-gray-100" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">산책로 저장</h2>

                <div className="space-y-5 mb-8">
                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">
                            이름 <span className="text-red-600">*</span>
                        </label>
                        <input
                            type="text"
                            value={routeName}
                            onChange={(e) => onRouteName(e.target.value)}
                            maxLength={50}
                            placeholder="예: 한강 산책로"
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all text-sm shadow-sm"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-900 mb-2.5 uppercase tracking-wider">
                            설명
                        </label>
                        <textarea
                            value={routeDescription}
                            onChange={(e) => onRouteDescription(e.target.value)}
                            maxLength={200}
                            rows={3}
                            placeholder="산책로에 대한 간단한 설명을 입력하세요"
                            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none text-sm shadow-sm"
                        />
                    </div>

                    <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                        <FaMapMarkerAlt className="text-blue-500" />
                        <span className="font-semibold">{routePoints.length}개 지점</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 py-3.5 bg-gray-100 hover:bg-gray-200 text-gray-900 rounded-2xl font-semibold text-sm transition-all active:scale-95"
                    >
                        취소
                    </button>
                    <button
                        onClick={onSave}
                        disabled={saving || !routeName.trim()}
                        className="flex-1 py-3.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-2xl font-semibold text-sm transition-all shadow-lg active:scale-95"
                    >
                        {saving ? '저장 중...' : '저장'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RouteModal;