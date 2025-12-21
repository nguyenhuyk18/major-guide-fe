import { Routes, Route } from "react-router";
import React from 'react';
import LayoutAdmin from "../components/LayoutAdmin";
import DashboardPage from "../pages/admin/DashboardPage";

export default function Routing() {
    return (
        <>
            <Routes >
                <Route path='/' element={<LayoutAdmin />} >
                    <Route index element={<DashboardPage />} />
                </Route>
            </Routes>
        </>
    );
}
