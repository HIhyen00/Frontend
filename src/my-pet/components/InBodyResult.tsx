import React from 'react';
import type { Pet, InBodyReport } from '../types/types';
import RadarChart from './RadarChart.tsx';
import AiChat from './AiChat.tsx'; // AI 채팅 컴포넌트 import

interface InBodyResultProps {
    pet: Pet;
    result: InBodyReport;
    onBack: () => void;
}

// 색상 매핑 (게이지 색상, 텍스트 색상 분리)
const colorMap: Record<string, { bar: string; text: string }> = {
    green: { bar: 'bg-green-500', text: 'text-green-500' },
    orange: { bar: 'bg-orange-500', text: 'text-orange-500' },
    yellow: { bar: 'bg-yellow-500', text: 'text-yellow-500' },
    purple: { bar: 'bg-purple-500', text: 'text-purple-500' },
    teal: { bar: 'bg-teal-500', text: 'text-teal-500' },
    pink: { bar: 'bg-pink-500', text: 'text-pink-500' },
};

const ScoreBar: React.FC<{ score: number; label: string; color: keyof typeof colorMap }> = ({ score, label, color }) => (
    <div>
        <div className="flex justify-between mb-1">
            <span className="text-base font-medium text-gray-700">{label}</span>
            <span className={`text-base font-medium ${colorMap[color].text}`}>{score} / 100</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
            <div
                className={`${colorMap[color].bar} h-4 rounded-full`}
                style={{ width: `${Math.max(0, Math.min(score, 100))}%` }}
            ></div>
        </div>
    </div>
);

const InBodyResult: React.FC<InBodyResultProps> = ({ pet, result, onBack }) => {
    const scoreColor =
        result.overallScore > 70
            ? 'text-blue-500'
            : result.overallScore > 40
                ? 'text-yellow-500'
                : 'text-red-500';

    const chartLabels = ['식습관', '활동량', '배변상태', '행동변화', '관절건강', '피부/모질'];

    // 안전하게 기본값 처리
    const scores = {
        diet: result.scores?.diet ?? 0,
        energy: result.scores?.energy ?? 0,
        stool: result.scores?.stool ?? 0,
        behavior: result.scores?.behavior ?? 0,
        joints: result.scores?.joints ?? 0,
        skin: result.scores?.skin ?? 0,
    };

    const renderChartCenterContent = () => {
        return (
            <div className="text-center">
                <p className="text-gray-500 text-sm">종합점수</p>
                <p className={`text-6xl font-bold ${scoreColor}`}>{result.overallScore}</p>
            </div>
        );
    };

    return (
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100 animate-fade-in">
            {/* Header */}
            <div className="relative text-center mb-6 pb-4 border-b-2 border-gray-200">
                <button onClick={onBack} className="absolute top-0 left-0 text-gray-400 hover:text-gray-600">
                    <i className="fas fa-arrow-left text-2xl"></i>
                </button>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">건강 분석 리포트</h2>
                <p className="text-sm text-gray-500 mt-1">{result.date}</p>
            </div>

            {/* Chart and Summary */}
            <div className="flex flex-col items-center">
                <RadarChart scores={scores} labels={chartLabels}>
                    {renderChartCenterContent()}
                </RadarChart>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl mt-8">
                <h4 className="font-bold text-lg text-gray-800 mb-2 text-center">종합 의견</h4>
                <p className="text-gray-600 leading-relaxed text-center">{result.summary}</p>
            </div>

            {/* Detailed Bar Scores */}
            <div className="mt-10">
                <h4 className="font-bold text-lg text-gray-800 mb-4 text-center">영역별 상세 점수</h4>
                <div className="space-y-4 max-w-lg mx-auto">
                    <ScoreBar score={scores.diet} label="식습관" color="green" />
                    <ScoreBar score={scores.energy} label="활동량" color="orange" />
                    <ScoreBar score={scores.stool} label="배변상태" color="yellow" />
                    <ScoreBar score={scores.behavior} label="행동변화" color="purple" />
                    <ScoreBar score={scores.joints} label="관절건강" color="teal" />
                    <ScoreBar score={scores.skin} label="피부/모질" color="pink" />
                </div>
            </div>

            {/* Comments & Recommendations */}
            <div className="mt-10">
                <h4 className="font-bold text-lg text-gray-800 mb-4 text-center">코멘트 및 추천사항</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Warnings Column */}
                    <div className="bg-red-50 p-5 rounded-lg">
                        <h5 className="font-bold text-red-700 mb-3"><i className="fas fa-exclamation-triangle mr-2"></i>주의사항</h5>
                        {result.warnings.length > 0 ? (
                            <ul className="space-y-2 list-disc list-inside text-red-600">
                                {result.warnings.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">특별한 주의사항이 발견되지 않았습니다.</p>
                        )}
                    </div>

                    {/* Recommendations Column */}
                    <div className="bg-blue-50 p-5 rounded-lg">
                        <h5 className="font-bold text-blue-700 mb-3"><i className="fas fa-check-circle mr-2"></i>추천사항</h5>
                        {result.recommendations.length > 0 ? (
                            <ul className="space-y-2 list-disc list-inside text-blue-600">
                                {result.recommendations.map((item, index) => <li key={index}>{item}</li>)}
                            </ul>
                        ) : (
                            <p className="text-gray-500 text-sm">특별히 추천드릴 사항이 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* AI Chat Section */}
            <AiChat reportId={result.id} petId={pet.id} />

            {/* Premium Upsell & Back Button */}
            <div className="mt-10 text-center">
                <button onClick={onBack} className="py-2 px-8 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition">
                    목록으로 돌아가기
                </button>
            </div>
        </div>
    );
};

export default InBodyResult;
