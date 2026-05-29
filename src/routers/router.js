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
import CreateExpert from "../pages/admin/expert/CreateExpert";
import SubcribeRegister from "../pages/admin/regiser/SubcribeRegister";
import HomePage from "../pages/client/HomePage";
import ContactPage from "../pages/client/ContactPage";
import QuizPage from "../pages/client/QuizPage";
import QuizHistoryPage from "../pages/client/QuizHistoryPage";
// import Header from "../components/Header";
import Layout from "../components/Layout";
import InformationPage from "../pages/admin/InformationPage";
import ExpertPage from "../pages/client/ExpertPage";
import ClientInformationPage from "../pages/client/ClientInformationPage";
import RegisterSchedulePage from "../pages/client/RegisterSchedulePage";
import HoldSlotPage from "../pages/client/HoldSlotPage";
import MyBookingsPage from "../pages/client/MyBookingsPage";
import PaymentCallbackPage from "../pages/client/PaymentCallbackPage";
import ExpertBookingManagePage from "../pages/admin/ExpertBookingManagePage";
import AccountManagementPage from "../pages/admin/AccountManagementPage";
import BlogPage from "../pages/client/BlogPage";
import PostDetailPage from "../pages/client/PostDetailPage";
import PostManagePage from "../pages/admin/PostManagePage";
import PostFormPage from "../pages/admin/PostFormPage";
import AdminChatPage from "../pages/admin/AdminChatPage";

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
                    <Route path="experts/add" element={<CreateExpert />} ></Route>
                    <Route path="expert-bookings" element={<ExpertBookingManagePage />} ></Route>
                    <Route path="subcribe-register" element={< SubcribeRegister />} ></Route>
                    <Route path="information" element={< InformationPage />} ></Route>
                    <Route path="posts" element={<PostManagePage />} />
                    <Route path="posts/create" element={<PostFormPage />} />
                    <Route path="posts/edit/:id" element={<PostFormPage />} />
                    <Route path="ai-chat" element={<AdminChatPage />} />
                    <Route path="account" element={<AccountManagementPage />} />

                </Route>
                <Route path="/admin/login" element={<ProtectedLoginAdmin> <LoginAdminPage /> </ProtectedLoginAdmin>} ></Route>


                <Route path="/" element={<Layout />}  >
                    <Route index element={<HomePage />} />
                    <Route path="contact" element={<ContactPage />} />
                    <Route path="experts" element={< ExpertPage />} ></Route>
                    <Route path="choose-schedule" element={< RegisterSchedulePage />} ></Route>
                    <Route path="hold-slot" element={< HoldSlotPage />} ></Route>
                    <Route path="my-bookings" element={< MyBookingsPage />} ></Route>
                    <Route path="payment-success.html" element={< PaymentCallbackPage />} ></Route>
                    <Route path="blog" element={<BlogPage />} />
                    <Route path="blog/:id" element={<PostDetailPage />} />
                    <Route path="thong-tin-ca-nhan.html" element={<ClientInformationPage />} />
                    <Route path="quiz" element={<QuizPage />} />
                    <Route path="quiz-history" element={<QuizHistoryPage />} />
                </Route>
            </Routes>
        </>
    );
}
