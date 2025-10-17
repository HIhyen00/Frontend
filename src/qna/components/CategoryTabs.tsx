import React from "react";

interface Props {
    activeCategory?: string;
    setActiveCategory: (cat?: string) => void;
    sortValue: string;
    onSortChange: (value: string) => void;
}

const categories = ["일상", "궁금해요", "기타"];

const sortOptions = [
    { value: "recommended", label: "추천순" },
    { value: "latest", label: "최신순" },
    { value: "popular", label: "조회순" },
];

const CategoryTabs: React.FC<Props> = ({
                                           activeCategory,
                                           setActiveCategory,
                                           sortValue,
                                           onSortChange,
                                       }) => {
    return (
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 px-4 bg-white border-b sticky top-0 z-10">
            {/* 카테고리 탭 */}
            <div className="flex gap-2 md:gap-4 overflow-x-auto">
                <button
                    className={`px-4 py-2 rounded whitespace-nowrap ${
                        !activeCategory
                            ? "font-bold border-b-2 border-purple-500 text-purple-600"
                            : "text-gray-500 hover:text-purple-600"
                    }`}
                    onClick={() => setActiveCategory(undefined)}
                >
                    전체
                </button>
                {categories.map((cat) => (
                    <button
                        key={cat}
                        className={`px-4 py-2 rounded whitespace-nowrap ${
                            activeCategory === cat
                                ? "font-bold border-b-2 border-purple-500 text-purple-600"
                                : "text-gray-500 hover:text-purple-600"
                        }`}
                        onClick={() => setActiveCategory(cat)}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* 정렬 드롭다운 */}
            <select
                value={sortValue}
                onChange={(e) => onSortChange(e.target.value)}
                className="border border-gray-300 px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-sm font-medium"
            >
                {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                        {opt.label}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default CategoryTabs;
