import { NavLink } from 'react-router-dom';
import '../assets/css/AsideAdmin.css'

export default function AsideAdmin() {
    return (
        <>
            <aside className="admin-sidebar d-flex flex-column flex-shrink-0 p-3 text-white">
                <div className="d-flex align-items-center mb-4 mb-md-0 me-md-auto text-decoration-none pt-2 px-2">
                    <div className="position-relative me-3">
                        <img src="https://ui-avatars.com/api/?name=Admin&background=10b981&color=fff" alt='' width={40} height={40} className="rounded-circle" />
                    </div>
                    <div className="d-flex flex-column">
                        <span className="fs-6 fw-bold">Admin Dashboard</span>
                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Quản trị viên cấp cao</span>
                    </div>
                </div>
                <hr className="admin-divider" />
                <ul className="nav nav-pills flex-column mb-auto">
                    <li className="nav-item mb-1">
                        <NavLink to="/" className="nav-link admin-nav-link">
                            <i className="bi bi-grid-fill me-2" />
                            Tổng quan
                        </NavLink>
                    </li>
                    <li className="nav-item mb-1">
                        <a href="/" className="nav-link admin-nav-link">
                            <i className="bi bi-calendar-event me-2" />
                            Quản lý lịch đăng ký
                        </a>
                    </li>
                    <li className="nav-item mb-1">
                        <a href="/" className="nav-link admin-nav-link">
                            <i className="bi bi-people-fill me-2" />
                            Quản lý chuyên gia
                        </a>
                    </li>
                    <li className="nav-item mb-1">
                        <a href="/" className="nav-link admin-nav-link">
                            <i className="bi bi-gear-fill me-2" />
                            Cài đặt
                        </a>
                    </li>
                </ul>
                <div className="mt-auto pt-3 border-top border-secondary border-opacity-25">
                    <a href="/" className="nav-link admin-nav-link d-flex align-items-center">
                        <i className="bi bi-box-arrow-right me-2" />
                        Đăng xuất
                    </a>
                </div>
            </aside>

        </>
    );
}
