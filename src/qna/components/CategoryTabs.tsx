import React from "react";

interface Props {
    activeCategory?: string;
    setActiveCategory: (cat?: string) => void;
}

const categories = ["일상", "궁금해요", "기타"];

const CategoryTabs: React.FC<Props> = ({ activeCategory, setActiveCategory }) => {
    return (
        <div className="flex gap-4 overflow-x-auto py-2 px-4 bg-white top-[57px] z-10 border-b font-bold">
            <button
                className={`px-4 py-2 rounded ${
                    !activeCategory ? "font-bold border-b-2 border-purple-500" : "text-gray-500"
                }`}
                onClick={() => setActiveCategory(undefined)}
            >
                전체
            </button>
            {categories.map(cat => (
                <button
                    key={cat}
                    className={`px-4 py-2 rounded ${
                        activeCategory === cat ? "font-bold border-b-2 border-purple-500" : "text-gray-500"
                    }`}
                    onClick={() => setActiveCategory(cat)}
                >
                    {cat}
                </button>
            ))}
        </div>
    );
};

export default CategoryTabs;
