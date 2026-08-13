// import React from 'react';
import '../assets/css/HeaderAdmin.css'
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { LOGOUT_ADMIN } from '../constants/AuthAdminConstant';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';


export default function HeaderAdmin({ onMenuClick }) {

    const userInfo = useSelector(state => state.authAdminReducer.loggedUser);

    const navigate = useNavigate()
    const dispatch = useDispatch()


    // console.log(userInfo)

    const handleLogout = () => {
        const action = {
            type: LOGOUT_ADMIN
        }
        dispatch(action);
        navigate('/admin');
    }

    return (
        <>
            <Helmet>
                <title>TRANG QUẢN TRỊ VIÊN</title>
            </Helmet>
            <header className="admin-header">
                <button className="admin-mobile-menu" type="button" onClick={onMenuClick}><i className="bi bi-list" /></button>
                <div className="admin-header-title"><span>Workspace</span><strong>Xin chào, {userInfo.name?.split(' ').slice(-1)[0] || 'bạn'}!</strong></div>
                <div className="admin-header-actions">

                    {/* Notification */}
                    <NotificationBell />

                    {/* User + Dropdown */}
                    <div className="dropdown">
                        <button
                            className="admin-account-trigger"
                            type="button"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ pointerEvents: '' }}
                        >
                            <div className="admin-account-copy">
                                <strong>
                                    {userInfo.name}
                                </strong>
                                <span>
                                    {userInfo.role_name === 'expert' ? 'Chuyên Gia Tư Vấn' : 'Quản Trị Viên'}
                                </span>
                            </div>

                            <img
                                src={userInfo.fileAvartarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(userInfo.name || 'Admin')}&background=5b7cfa&color=fff`}
                                alt="Avatar"
                            />
                            <i className="bi bi-chevron-down admin-account-chevron" />
                        </button>

                        {/* Dropdown menu */}
                        <ul className="dropdown-menu dropdown-menu-end shadow admin-dropdown">
                            <li>
                                <Link className="dropdown-item" to="/admin/information">
                                    <i className="bi bi-person me-2" />
                                    Thông tin cá nhân
                                </Link>
                            </li>
                            <li>
                                <Link className="dropdown-item" to="">
                                    <i className="bi bi-gear me-2" />
                                    Cài đặt
                                </Link>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                                <button onClick={handleLogout} className="dropdown-item text-danger" >
                                    <i className="bi bi-box-arrow-right me-2" />
                                    Đăng xuất
                                </button>
                            </li>
                        </ul>
                    </div>

                </div>
            </header>

        </>
    );
}
