import { FaPaw } from "react-icons/fa";

function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="max-w-7xl mx-auto px-6 py-12 text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                    <FaPaw className="text-2xl text-blue-600" />
                    <span className="font-bold text-lg text-gray-800">MyRealPet</span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed mb-6">
                    반려동물과 함께하는 일상을 공유하세요
                </p>
                <p className="text-sm text-gray-500">
                    © 2025 MyRealPet. All rights reserved.
                </p>
            </div>
        </footer>
    );
}

export default Footer;
