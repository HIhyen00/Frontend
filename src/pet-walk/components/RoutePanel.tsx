import React from 'react';
import { FaPlus, FaTrash, FaCheck, FaTimes, FaUndo } from 'react-icons/fa';

interface RoutePanelProps {
    isDrawingMode: boolean;
    routePoints: { lat: number; lng: number }[];
    savedRoutes: any[];
    loadingRoutes: boolean;
    selectedRoute: any;
    onToggleDrawingMode: () => void;
    onCompleteDrawing: () => void;
    onCancelDrawing: () => void;
    onUndoLastPoint: () => void;
    onToggleRouteDisplay: (route: any) => void;
    onDeleteRoute: (routeId: number) => void;
}

const RoutePanel: React.FC<RoutePanelProps> = ({
    isDrawingMode,
    routePoints,
    savedRoutes,
    loadingRoutes,
    selectedRoute,
    onToggleDrawingMode,
    onCompleteDrawing,
    onCancelDrawing,
    onUndoLastPoint,
    onToggleRouteDisplay,
    onDeleteRoute,
}) => {
    return (
        <div className="p-6 space-y-4">
            {/* Drawing Mode */}
            {isDrawingMode ? (
                <div className="p-4 bg-blue-50 border-2 border-blue-500 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-bold text-blue-900 text-sm">경로 그리는 중</h3>
                        <span className="text-xs text-blue-600 font-bold px-2.5 py-1 bg-blue-100 rounded-full">
                            {routePoints.length}개 지점
                        </span>
                    </div>
                    <p className="text-sm text-blue-700 leading-relaxed">지도를 클릭하여 산책 경로를 그려보세요</p>
                    <div className="flex gap-2.5">
                        <button
                            onClick={onUndoLastPoint}
                            disabled={routePoints.length === 0}
                            className="px-3 py-2.5 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-300 text-gray-700 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5"
                            title="마지막 지점 삭제"
                        >
                            <FaUndo className="w-3.5 h-3.5" />
                        </button>
                        <button
                            onClick={onCompleteDrawing}
                            disabled={routePoints.length < 2}
                            className="flex-1 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 shadow-md"
                        >
                            <FaCheck className="w-3.5 h-3.5" /> 완료
                        </button>
                        <button
                            onClick={onCancelDrawing}
                            className="flex-1 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2"
                        >
                            <FaTimes className="w-3.5 h-3.5" /> 취소
                        </button>
                    </div>
                </div>
            ) : (
                <button
                    onClick={onToggleDrawingMode}
                    className="w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 active:scale-[0.98]"
                >
                    <FaPlus className="w-4 h-4" /> 새 산책로 만들기
                </button>
            )}

            {/* Saved Routes */}
            {loadingRoutes ? (
                <div className="flex justify-center py-16">
                    <div className="animate-spin rounded-full h-10 w-10 border-3 border-blue-500 border-t-transparent"></div>
                </div>
            ) : savedRoutes.length > 0 ? (
                <div className="space-y-2.5">
                    {savedRoutes.map((route) => (
                        <div
                            key={route.id}
                            className={`
                                p-4 rounded-2xl transition-all cursor-pointer
                                ${selectedRoute?.id === route.id
                                    ? 'bg-green-50 border-2 border-green-500 shadow-xl'
                                    : 'bg-white border border-gray-200 hover:border-green-400 hover:shadow-lg'
                                }
                            `}
                            onClick={() => onToggleRouteDisplay(route)}
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2 flex-1">
                                    <h4 className="font-bold text-gray-900 text-sm">{route.name}</h4>
                                    {selectedRoute?.id === route.id && (
                                        <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-semibold">
                                            표시중
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteRoute(route.id);
                                    }}
                                    className="text-gray-400 hover:text-red-600 transition-colors p-1 hover:bg-red-50 rounded-lg"
                                >
                                    <FaTrash className="w-3.5 h-3.5" />
                                </button>
                            </div>
                            {route.description && (
                                <p className="text-xs text-gray-600 mb-2 leading-relaxed">{route.description}</p>
                            )}
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-gray-400 font-medium">
                                    {new Date(route.createdAt).toLocaleDateString('ko-KR')}
                                </p>
                                <p className="text-xs text-green-600 font-semibold">
                                    {route.coordinates?.length || 0}개 지점
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="text-6xl mb-4">🐾</div>
                    <p className="text-gray-900 font-semibold mb-1.5">저장된 산책로가 없습니다</p>
                    <p className="text-sm text-gray-500">새 산책로를 만들어보세요</p>
                </div>
            )}
        </div>
    );
};

export default RoutePanel;