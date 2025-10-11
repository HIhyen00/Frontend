import {lazy, Suspense} from "react"
import {BrowserRouter, Route, Routes, useNavigate} from "react-router-dom";
import Layout from "../shared/components/layouts/Layout.tsx";
import HealthReportPage from "../my-pet/pages/health-report/HealthReportPage.tsx";
import Register from "../account/pages/Register.tsx";
import {useAuth} from "../account/hooks/useAuth.tsx";
import {FaSignOutAlt} from "react-icons/fa";


const Home = lazy(() => import("../landing/pages/Home.tsx"));
const PetSns = lazy(() => import("../sns/pages/PetSns.tsx"));
const PetWalk = lazy(() => import("../pet-walk/pages/PetWalk.tsx"));
const MyPetPage = lazy(() => import("../my-pet/pages/my-pet/MyPetPage.tsx"));
const Login = lazy(() => import("../account/pages/Login.tsx"));
const MyPage = lazy(() => import("../account/pages/MyPage.tsx"));
const MedicalRecord = lazy(() => import("../my-pet/pages/medical-record/MedicalRecordPage.tsx"));

function LogoutModal() {
    const {showLogoutModal, setShowLogoutModal, logout} = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            setShowLogoutModal(false);
            navigate('/');
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (!showLogoutModal) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
            <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full mx-4 animate-fadeIn">
                <div className="text-center mb-6">
                    <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <FaSignOutAlt className="text-2xl text-red-600"/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">로그아웃 하시겠습니까?</h3>
                    <p className="text-sm text-gray-600">
                        로그아웃하면 일부 기능을 사용할 수 없습니다.
                    </p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => setShowLogoutModal(false)}
                        className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex-1 px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-colors"
                    >
                        로그아웃
                    </button>
                </div>
            </div>
        </div>
    );
}

function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-500 border-opacity-50"></div>
            </div>}>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route element={<Layout/>}>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/sns" element={<PetSns/>}/>
                        <Route path="/pet-walk" element={<PetWalk/>}/>
                        <Route path="/my-pet" element={<MyPetPage/>}/>
                        <Route path="/my-page" element={<MyPage/>}/>
                        <Route path="/health-report/:petId" element={<HealthReportPage/>}/>
                        <Route path="/medical-record/:petId" element={<MedicalRecord/>}/>
                    </Route>
                </Routes>
                <LogoutModal/>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRouter;
