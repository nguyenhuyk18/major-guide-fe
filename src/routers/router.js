import { Routes, Route, useNavigate } from "react-router";
import LayoutAdmin from "../components/LayoutAdmin";
import DashboardPage from "../pages/admin/DashboardPage";
import RegisterPage from "../pages/admin/RegisterPage";
import ShiftDetailPage from "../pages/admin/ShiftDetailPage";
import ReviewRegisterPage from "../pages/admin/ReviewRegisterPage";
import RegisterDetailPage from "../pages/admin/RegisterDetailPage";
import LoginAdminPage from "../pages/admin/LoginAdminPage";
import ProtectedRouterAdmin from "./ProtectedRouterAdmin";
import ProtectedLoginAdmin from "./ProtectedLoginAdmin";
import ExpertManagePage from "../pages/admin/expert/ExpertManagePage";
import { useEffect } from "react";
import { setNavigate } from "../helpers/help";

export default function Routing() {

    const navigate = useNavigate();

    useEffect(() => {
        setNavigate(navigate);
    }, [navigate]);


    return (
        <>
            <Routes>
                <Route path='/admin' element={<ProtectedRouterAdmin> <LayoutAdmin /> </ProtectedRouterAdmin>} >
                    <Route index element={<DashboardPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="shift-detail/:id_shift_day/:day" element={<ShiftDetailPage />} />
                    <Route path="schedule-review" element={<ReviewRegisterPage />} />
                    <Route path="review-detail/:id_register" element={<RegisterDetailPage />} ></Route>
                    <Route path="experts" element={<ExpertManagePage />} ></Route>
                </Route>
                <Route path="/admin/login" element={<ProtectedLoginAdmin> <LoginAdminPage /> </ProtectedLoginAdmin>} ></Route>
            </Routes>
        </>
    );
}
