import {useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {FaPaw, FaBars, FaTimes, FaUser, FaSignOutAlt} from "react-icons/fa";
import {NAV_ITEMS} from "../../constants/navigation.ts";
import {useAuth} from "../../../account/hooks";

function Header() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const navigate = useNavigate();
    const {isAuthenticated, user, setShowLogoutModal} = useAuth();

    const goToPage = (url: string) => {
        navigate(url);
    }

    const openLogoutModal = () => {
        setShowLogoutModal(true);
        setUserMenuOpen(false);
    };

    useEffect(() => {
        const handleClickOutside = () => {
            setUserMenuOpen(false);
        };

        if (userMenuOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [userMenuOpen]);

    return (
        <header
            className={"h-16 w-full fixed top-0 z-50 transition-all duration-300 bg-white shadow-lg backdrop-blur-lg bg-opacity-90"}
        >
            <div className="flex items-center justify-between w-full max-w-7xl mx-auto h-full px-6">
                <div className="flex items-center space-x-2">
                    <div className="flex items-center cursor-pointer">
                        <FaPaw className={"text-2xl text-blue-600"}/>
                        <h1 onClick={() => goToPage("/")}
                            className={"text-xl font-bold ml-2 text-gray-900"}>MyRealPet</h1>
                    </div>
                </div>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-8">
                    {NAV_ITEMS.map((item, index) => (
                        <a key={index} onClick={() => goToPage(item.path)}
                           className={"font-medium transition-colors hover:text-blue-600 cursor-pointer text-gray-700"}>{item.name}</a>
                    ))}
                </nav>

                <div className="flex items-center space-x-4">
                    {isAuthenticated ? (
                        <div className="relative hidden md:block">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setUserMenuOpen(!userMenuOpen);
                                }}
                                className={"flex items-center space-x-2 px-4 py-2 font-semibold rounded-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"}>
                                <FaUser className="text-sm"/>
                                <span>{user?.username}</span>
                            </button>

                            {userMenuOpen && (
                                <div
                                    onClick={(e) => e.stopPropagation()}
                                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
                                    <button
                                        onClick={() => {
                                            navigate('/my-page');
                                            setUserMenuOpen(false);
                                        }}
                                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                                        <FaUser/>
                                        <span>마이페이지</span>
                                    </button>
                                    <button
                                        onClick={openLogoutModal}
                                        className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-100 flex items-center space-x-2">
                                        <FaSignOutAlt/>
                                        <span>로그아웃</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <button
                            onClick={() => navigate('/login')}
                            className={"hidden md:block px-5 py-2.5 font-semibold rounded-lg transition-all duration-300 bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"}>
                            로그인
                        </button>
                    )}

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden text-2xl"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen
                            ? <FaTimes className={"text-gray-900"}/>
                            : <FaBars className={"text-gray-900"}/>}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 right-0 bg-white shadow-xl border-t border-gray-100 z-50 max-h-[calc(100vh-4rem)] overflow-y-auto">
                    <nav className="flex flex-col py-4 px-6">
                        {NAV_ITEMS.map((item, index) => (
                            <a
                                key={index}
                                onClick={() => {
                                    goToPage(item.path);
                                    setMobileMenuOpen(false);
                                }}
                                className="py-3 text-gray-700 hover:text-blue-600 hover:bg-gray-50 transition-colors font-medium cursor-pointer rounded-lg px-3"
                            >
                                {item.name}
                            </a>
                        ))}

                        {isAuthenticated ? (
                            <div className="flex flex-col space-y-3 pt-4 mt-4 border-t border-gray-200">
                                <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-lg">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                                        <FaUser className="text-blue-600"/>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">로그인됨</p>
                                        <p className="text-gray-900 font-semibold">{user?.username}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        navigate('/my-page');
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaUser/>
                                    <span>마이페이지</span>
                                </button>
                                <button
                                    onClick={() => {
                                        openLogoutModal();
                                        setMobileMenuOpen(false);
                                    }}
                                    className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <FaSignOutAlt/>
                                    <span>로그아웃</span>
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    navigate('/login');
                                    setMobileMenuOpen(false);
                                }}
                                className="w-full mt-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                                로그인
                            </button>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}

export default Header;