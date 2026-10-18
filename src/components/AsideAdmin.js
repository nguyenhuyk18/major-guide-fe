import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { LOGOUT_ADMIN } from '../constants/AuthAdminConstant';
import '../assets/css/AsideAdmin.css'

export default function AsideAdmin({ open = false, onClose }) {
    const location = useLocation();
    const adminInfo = useSelector(state => state.authAdminReducer.loggedUser);
    const isAdmin = adminInfo?.role_name === 'admin';
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const avatar = adminInfo?.fileAvartarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminInfo?.name || 'Admin')}&background=5b7cfa&color=fff`;
    const logout = () => { dispatch({ type: LOGOUT_ADMIN }); navigate('/admin/login'); };


    return (
        <>
            <aside className={`admin-sidebar ${open ? 'show' : ''}`}>
                <div className="admin-sidebar-brand">
                    <span className="admin-brand-mark"><i className="bi bi-mortarboard-fill" /></span>
                    <div><strong>MajorGuide</strong><small>Expert workspace</small></div>
                    <button type="button" onClick={onClose} aria-label="Đóng menu"><i className="bi bi-x-lg" /></button>
                </div>
                <div className="admin-sidebar-user"><img src={avatar} alt={adminInfo?.name || 'Tài khoản'} /><div><strong>{adminInfo?.name || 'Tài khoản'}</strong><span><i />{isAdmin ? 'Quản trị viên' : 'Chuyên gia'}</span></div></div>
                <p className="admin-nav-caption">Không gian làm việc</p>
                <ul className="nav nav-pills flex-column mb-auto" onClick={onClose}>
                    <li className="nav-item mb-1">
                        <Link to="/admin" className={`${location.pathname.match(/^\/admin$/) ? 'active' : ''}  nav-link admin-nav-link`}>
                            <i className="bi bi-grid-fill me-2" />
                            Tổng quan
                        </Link>
                    </li>
                    <li className="nav-item mb-1">
                        <Link to="/admin/register" className={`${location.pathname.match(/^\/admin\/register$/) || location.pathname.match(/^\/admin\/shift-detail/) ? 'active' : ''} nav-link admin-nav-link`}>
                            <i className="bi bi-calendar-event me-2" />
                            Quản lý lịch đăng ký
                        </Link>
                    </li>

                    <li className="nav-item mb-1">
                        <Link to="/admin/schedule-review" className={`${location.pathname.match(/^\/admin\/schedule-review$/) || location.pathname.match(/^\/admin\/review-detail/) ? 'active' : ''} nav-link admin-nav-link`}>
                            <i className="bi bi-card-checklist me-2"></i>
                            Đơn đăng ký lịch
                        </Link>
                    </li>
                    <li className="nav-item mb-1">
                        <Link to="/admin/experts" className={`nav-link admin-nav-link ${location.pathname.match(/^\/admin\/experts$/) || location.pathname.match(/^\/admin\/experts\/add$/) ? 'active' : ''}`}>
                            <i className="bi bi-people-fill me-2" />
                            Quản lý chuyên gia
                        </Link>
                    </li>
                    { isAdmin ? '' :
                                        <li className="nav-item mb-1">
                                        <Link to="/admin/expert-bookings" className={`nav-link admin-nav-link ${location.pathname.match(/^\/admin\/expert-bookings$/) ? 'active' : ''}`}>
                                            <i className="bi bi-calendar-check me-2" />
                                            Lịch đặt chuyên gia
                                        </Link>
                                    </li>
                    }

                    {isAdmin ? '' : <li className="nav-item mb-1">
                        <Link to="/admin/messages" className={`nav-link admin-nav-link ${location.pathname.match(/^\/admin\/messages/) ? 'active' : ''}`}>
                            <i className="bi bi-chat-dots-fill me-2" />
                            Tin nhắn học viên
                        </Link>
                    </li>}

                    { isAdmin ? '' : <li className="nav-item mb-1">
                        <Link to="/admin/subcribe-register" className={`nav-link admin-nav-link ${location.pathname.match(/^\/admin\/subcribe-register$/) ? 'active' : ''}`}>
                            <i className="bi bi-calendar-plus me-2" />
                            Đăng ký lịch tư vấn
                        </Link>
                    </li> }

                    <li className="nav-item mb-1">
                        <Link to="/admin/posts" className={`nav-link admin-nav-link ${location.pathname.match(/^\/admin\/posts/) ? 'active' : ''}`}>
                            <i className="bi bi-file-post me-2" />
                            {isAdmin ? 'Quản lý bài viết' : 'Bài viết của tôi'}
                        </Link>
                    </li>
                        
                    { isAdmin ?  <li className="nav-item mb-1">
                        <Link to="/admin/ai-chat" className={`nav-link admin-nav-link ${location.pathname.match(/^\/admin\/ai-chat/) ? 'active' : ''}`}>
                            <i className="bi bi-robot me-2" />
                            AI Chat
                        </Link>
                    </li> : '' }
                    { isAdmin ? <li className="nav-item mb-1">
                        <Link to="/admin/account" className={`nav-link admin-nav-link ${location.pathname.match(/^\/admin\/account(?:\/|$)/) ? 'active' : ''}`}>
                            <i className="bi bi-person-gear me-2"></i>
                            Quản lý tài khoản
                        </Link>
                    </li> : '' }

                    {isAdmin && <li className="nav-item mb-1"><Link to="/admin/accounting" className={`nav-link admin-nav-link ${location.pathname.startsWith('/admin/accounting') ? 'active' : ''}`}><i className="bi bi-wallet2 me-2" />Thu chi & hóa đơn</Link></li>}
                    {/* <li className="nav-item mb-1">
                        <Link to="/admin" className="nav-link admin-nav-link">
                            <i className="bi bi-gear-fill me-2" />
                            Cài đặt
                        </Link>
                    </li> */}
                </ul>
                <div className="admin-sidebar-bottom">
                    <Link to="/" className="admin-back-site"><i className="bi bi-globe2" /> Xem trang chủ</Link>
                    <button type="button" className="admin-logout-button" onClick={logout}><i className="bi bi-box-arrow-right" />Đăng xuất</button>
                </div>
            </aside>

        </>
    );
}
