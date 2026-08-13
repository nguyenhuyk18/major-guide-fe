import React, { useState } from 'react';
import HeaderAdmin from './HeaderAdmin';
import AsideAdmin from './AsideAdmin';
import FooterAdmin from './FooterAdmin';
import { Outlet } from 'react-router-dom';

export default function LayoutAdmin() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="admin-layout">

            {/* 1. Sidebar để riêng (giữ nguyên vị trí fixed bên trái) */}
            <AsideAdmin open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            {sidebarOpen && <button className="admin-sidebar-overlay" type="button" aria-label="Đóng menu" onClick={() => setSidebarOpen(false)} />}

            {/* 2. Wrapper nội dung bên phải: THÊM min-vh-100 VÀO ĐÂY */}
            <div className="admin-main-content d-flex flex-column min-vh-100 w-100">

                {/* Header nằm trên cùng */}
                <HeaderAdmin onMenuClick={() => setSidebarOpen(true)} />

                {/* Outlet (Nội dung thay đổi): Cần bọc trong thẻ có flex-grow-1 
            để nó đẩy Footer xuống đáy khi nội dung ngắn */}
                <main className="admin-page-content flex-grow-1">
                    <Outlet />
                </main>

                {/* Footer nằm dưới cùng */}
                <FooterAdmin />

            </div>

        </div>
    );
}
