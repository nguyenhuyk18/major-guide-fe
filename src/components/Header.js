import { useDispatch, useSelector } from 'react-redux';
import '../assets/css/Header.css'
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback } from 'react';
import { getAllBooking } from '../services/booking.api';
// import { getAllRegisterById } from '../services/slot.api';
// import { LOGOUT_ADMIN } from '../constants/AuthAdminConstant';
import { LOGOUT } from '../constants/AuthConstant';
import BookingDetailModal from './BookingDetailModal';

export default function Header() {

    const userInfo = useSelector(state => state.authClientReducer.loggedUser);
    const isLogin = useSelector(state => state.authClientReducer.isLogin);
    const [showDropdown, setShowDropdown] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [loadingBookings, setLoadingBookings] = useState(false);
    const dropdownRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const fetchBookings = useCallback(async () => {
        if (!userInfo?._id) return;
        setLoadingBookings(true);
        try {
            const res = await getAllBooking(userInfo._id);
            if (res?.data) {
                const data = res.data;
                if (Array.isArray(data)) {
                    setBookings(data);
                } else {
                    const bookingArray = Object.keys(data)
                        .filter(key => key.match(/^[0-9]+$/))
                        .map(key => data[key]);
                    setBookings(bookingArray);
                }
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoadingBookings(false);
        }
    }, [userInfo?._id]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch bookings when dropdown opens
    useEffect(() => {
        if (showDropdown && isLogin && userInfo?._id) {
            fetchBookings();
        }
    }, [showDropdown, isLogin, userInfo, fetchBookings]);

    const handleLogout = () => {
        const action = {
            type: LOGOUT
        }
        dispatch(action);
        navigate('/');
    }

    const handleViewBookingDetail = (booking) => {
        setSelectedBooking(booking);
        setShowBookingModal(true);
    }

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'reserved': return 'status-reserved';
            case 'paied': return 'status-paid';
            case 'cancle': return 'status-cancelled';
            case 'failed': return 'status-failed';
            default: return 'status-reserved';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'reserved': return 'Chờ thanh toán';
            case 'paied': return 'Đã thanh toán';
            case 'cancle': return 'Đã hủy';
            case 'failed': return 'Thất bại';
            default: return status;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        const parts = name.split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const getAvatarUrl = () => {
        if (userInfo?.fileAvartarUrl) {
            return userInfo.fileAvartarUrl;
        }
        return null;
    };

    return (
        <>
            <header className="client-header">
                <div className="container">
                    <div className="client-header-content">
                        {/* Logo */}
                        <div className="client-logo" style={{ cursor: 'pointer' }}>
                            <div className="client-logo-icon">
                                <i className="bi bi-mortarboard-fill"></i>
                            </div>
                            <span className="client-logo-text">MajorGuide</span>
                        </div>

                        {/* Navigation */}
                        <nav className="client-nav">
                            <Link className={`client-nav-link ${location.pathname.match(/^\/$/) ? 'active' : ''}`} to="/">
                                <i className="bi bi-house-door nav-link-icon"></i>
                                <span>Trang chủ</span>
                            </Link>
                            <Link className={`client-nav-link ${location.pathname.match(/^\/blog/) ? 'active' : ''}`} to="/blog">
                                <i className="bi bi-journal-text nav-link-icon"></i>
                                <span>Blog</span>
                            </Link>
                            <Link className={`client-nav-link ${location.pathname.match(/^\/experts$/) ? 'active' : ''}`} to="/experts">
                                <i className="bi bi-people nav-link-icon"></i>
                                <span>Chuyên gia</span>
                            </Link>
                            <Link className={`client-nav-link ${location.pathname.match(/^\/my-bookings$/) ? 'active' : ''}`} to="/my-bookings">
                                <i className="bi bi-calendar-check nav-link-icon"></i>
                                <span>Lịch đặt</span>
                            </Link>
                            <Link className={`client-nav-link ${location.pathname.match(/^\/contact$/) ? 'active' : ''}`} to="/contact">
                                <i className="bi bi-envelope nav-link-icon"></i>
                                <span>Liên hệ</span>
                            </Link>
                        </nav>

                        {/* Actions */}
                        {
                            isLogin ? <div className="user-dropdown-wrapper" ref={dropdownRef}>
                                <button
                                    className="user-dropdown-btn"
                                    onClick={() => setShowDropdown(!showDropdown)}
                                >
                                    <div className="user-avatar-container">
                                        {getAvatarUrl() ? (
                                            <img src={getAvatarUrl()} alt={userInfo.name} className="user-avatar-img" />
                                        ) : (
                                            <div className="user-avatar-placeholder">
                                                {getInitials(userInfo.name)}
                                            </div>
                                        )}
                                    </div>
                                    <span className="user-name">{userInfo.name}</span>
                                    <i className={`bi ${showDropdown ? 'bi-chevron-up' : 'bi-chevron-down'}`}></i>
                                </button>

                                {showDropdown && (
                                    <div className="user-dropdown-menu">
                                        <div className="dropdown-user-info">
                                            <div className="dropdown-user-avatar">
                                                {getAvatarUrl() ? (
                                                    <img src={getAvatarUrl()} alt={userInfo.name} className="dropdown-avatar-img" />
                                                ) : (
                                                    <div className="dropdown-avatar-placeholder">
                                                        {getInitials(userInfo.name)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="dropdown-user-details">
                                                <span className="dropdown-user-name">{userInfo.name}</span>
                                                <span className="dropdown-user-email">{userInfo.email || 'Khách hàng'}</span>
                                            </div>
                                        </div>

                                        <div className="dropdown-divider"></div>

                                        <div className="dropdown-section-title">
                                            <i className="bi bi-calendar-check"></i>
                                            Lịch đã đặt gần đây
                                        </div>

                                        {loadingBookings ? (
                                            <div className="dropdown-loading">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <span>Đang tải...</span>
                                            </div>
                                        ) : bookings.length > 0 ? (
                                            <div className="dropdown-bookings-list">
                                                {bookings.slice(0, 5).map((booking, index) => (
                                                    <div 
                                                        key={booking._id || index} 
                                                        className="dropdown-booking-item"
                                                        onClick={() => handleViewBookingDetail(booking)}
                                                    >
                                                        <div className="booking-item-info">
                                                            <span className="booking-item-date">
                                                                {formatDate(booking.day_support)}
                                                            </span>
                                                            <span className="booking-item-time">
                                                                {formatTime(booking.time_start)} - {formatTime(booking.time_end)}
                                                            </span>
                                                        </div>
                                                        <span className={`booking-item-status ${getStatusBadgeClass(booking.status)}`}>
                                                            {getStatusText(booking.status)}
                                                        </span>
                                                    </div>
                                                ))}
                                                <Link 
                                                    to="/my-bookings" 
                                                    className="dropdown-view-all"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    Xem tất cả lịch đặt
                                                    <i className="bi bi-arrow-right"></i>
                                                </Link>
                                            </div>
                                        ) : (
                                            <div className="dropdown-empty">
                                                <i className="bi bi-calendar-x"></i>
                                                <span>Chưa có lịch đặt nào</span>
                                            </div>
                                        )}

                                        <div className="dropdown-divider"></div>

                                        <Link 
                                            to="/thong-tin-ca-nhan.html" 
                                            className="dropdown-menu-item"
                                            onClick={() => setShowDropdown(false)}
                                        >
                                            <i className="bi bi-person"></i>
                                            Thông tin tài khoản
                                        </Link>

                                        {isLogin && (
                                            <>
                                                <Link 
                                                    to="/quiz" 
                                                    className="dropdown-menu-item"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <i className="bi bi-clipboard2-check"></i>
                                                    Làm bài test
                                                </Link>
                                                <Link 
                                                    to="/quiz-history" 
                                                    className="dropdown-menu-item"
                                                    onClick={() => setShowDropdown(false)}
                                                >
                                                    <i className="bi bi-clock-history"></i>
                                                    Lịch sử test
                                                </Link>
                                            </>
                                        )}

                                        <div className="dropdown-divider"></div>

                                        <button 
                                            className="dropdown-menu-item text-danger"
                                            onClick={handleLogout}
                                        >
                                            <i className="bi bi-box-arrow-right"></i>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div> : <div className="client-header-actions">
                                <button className="client-btn-login" data-bs-toggle="modal" data-bs-target="#loginClientModal">
                                    <i className="bi bi-box-arrow-in-right me-1"></i>Đăng nhập
                                </button>
                                <button className="client-btn-register" data-bs-toggle="modal" data-bs-target="#registerClientModal">
                                    <i className="bi bi-person-plus me-1"></i>Đăng ký
                                </button>
                            </div>
                        }
                    </div>
                </div>
            </header>

            {selectedBooking && (
                <BookingDetailModal 
                    booking={selectedBooking} 
                    show={showBookingModal} 
                    onClose={() => {
                        setShowBookingModal(false);
                        setSelectedBooking(null);
                    }} 
                />
            )}
        </>
    );
}
