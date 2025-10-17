import React from "react";

interface Props {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<Props> = ({ currentPage, totalPages, onPageChange }) => {
    const pages = Array.from({ length: totalPages }, (_, i) => i);
    return (
        <div className="flex justify-center mt-4 space-x-1">
            {pages.map(p => (
                <button
                    key={p}
                    onClick={() => onPageChange(p)}
                    className={`px-2 py-1 border rounded ${p === currentPage ? "bg-blue-500 text-white" : "bg-white"}`}
                >
                    {p + 1}
                </button>
            ))}
        </div>
    );
};

export default Pagination;
