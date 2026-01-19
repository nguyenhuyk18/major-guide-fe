// import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '../assets/css/HeaderAdmin.css'
import { faBell } from '@fortawesome/free-regular-svg-icons';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { LOGOUT_ADMIN } from '../constants/AuthAdminConstant';
import { useNavigate } from 'react-router-dom';


export default function HeaderAdmin() {

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
            <header className="admin-header px-4 py-3">
                <div className="d-flex align-items-center ms-auto gap-4 setting-account">

                    {/* Notification */}
                    <div className="position-relative cursor-pointer">
                        <FontAwesomeIcon icon={faBell} className="text-secondary fs-5" />
                        <span className="position-absolute top-0 start-100 translate-middle p-1 bg-danger border border-dark rounded-circle" />
                    </div>

                    {/* User + Dropdown */}
                    <div className="dropdown">
                        <div
                            className="d-flex align-items-center gap-3 cursor-pointer"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                            style={{ pointerEvents: '' }}
                        >
                            <div className="text-end d-none d-md-block">
                                <div className="fw-semibold text-white" style={{ fontSize: '0.9rem' }}>
                                    {userInfo.name}
                                </div>
                                <div className="text-secondary" style={{ fontSize: '0.75rem' }}>
                                    {userInfo.role_name === 'expert' ? 'Chuyên Gia Tư Vấn' : 'Quản Trị Viên'}
                                </div>
                            </div>

                            <img
                                src={`${userInfo.fileAvartarUrl}`}
                                className="rounded-circle border border-secondary"
                                width={40}
                                height={40}
                                alt="Avatar"
                            />
                        </div>

                        {/* Dropdown menu */}
                        <ul className="dropdown-menu dropdown-menu-end shadow admin-dropdown">
                            <li>
                                <a className="dropdown-item" href="/">
                                    <i className="bi bi-person me-2" />
                                    Thông tin cá nhân
                                </a>
                            </li>
                            <li>
                                <a className="dropdown-item" href="/">
                                    <i className="bi bi-gear me-2" />
                                    Cài đặt
                                </a>
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
