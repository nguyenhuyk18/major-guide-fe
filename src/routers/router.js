import { Routes, Route } from "react-router";
import React from 'react';
import LayoutAdmin from "../components/LayoutAdmin";
import DashboardPage from "../pages/admin/DashboardPage";
import RegisterPage from "../pages/admin/RegisterPage";
import ShiftDetailPage from "../pages/admin/ShiftDetailPage";

export default function Routing() {
    return (
        <>
            <Routes>
                <Route path='/admin' element={<LayoutAdmin />} >
                    <Route index element={<DashboardPage />} />
                    <Route path="register" element={<RegisterPage />} />
                    <Route path="shift-detail/:id_shift_day" element={<ShiftDetailPage />} />
                </Route>
            </Routes>
        </>
    );
}
