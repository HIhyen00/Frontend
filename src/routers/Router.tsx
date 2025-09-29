import {lazy, Suspense} from "react"
import {BrowserRouter, Route, Routes} from "react-router-dom";
import Layout from "../shared/components/layouts/Layout.tsx";
import HealthReportPage from "../my-pet/pages/health-report/HealthReportPage.tsx";
import Register from "../account/pages/Register.tsx";


const Home = lazy(() => import("../landing/pages/Home.tsx"));
const PetSns = lazy(() => import("../sns/pages/PetSns.tsx"));
const PetWalk = lazy(() => import("../pet-walk/pages/PetWalk.tsx"));
const MyPetPage = lazy(() => import("../my-pet/pages/my-pet/MyPetPage.tsx"));
const Login = lazy(() => import("../account/pages/Login.tsx"));

function AppRouter() {
    return (
        <BrowserRouter>
            <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route path="/register" element={<Register/>}/>
                    <Route element={<Layout/>}>
                        <Route path="/" element={<Home/>}/>
                        <Route path="/sns" element={<PetSns/>}/>
                        <Route path="/pet-walk" element={<PetWalk/>}/>
                        <Route path="/my-pet" element={<MyPetPage/>}/>
                        <Route path="/health-report/:petId" element={<HealthReportPage />}/>
                    </Route>
                </Routes>
            </Suspense>
        </BrowserRouter>
    )
}

export default AppRouter;
