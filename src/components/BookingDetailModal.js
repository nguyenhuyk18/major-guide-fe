import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getExpertInfo } from '../services/expert.api';
import { isToday } from '../helpers/date';
import '../assets/css/BookingDetailModal.css';
import { useNavigate } from 'react-router-dom';

export default function BookingDetailModal({ booking, show, onClose }) {
    const navigate = useNavigate();
    const userInfo = useSelector(state => state.authClientReducer.loggedUser);
    const [loading, setLoading] = useState(true);
    const [expertInfo, setExpertInfo] = useState(null);
    const [memberInfo, setMemberInfo] = useState(null);

    useEffect(() => {
        if (show && booking) {
            fetchBookingDetails();
        }
    }, [show, booking]);

    const fetchBookingDetails = async () => {
        setLoading(true);
        try {
            const data = await getExpertInfo(booking.id_expert, booking.id_member);
            setExpertInfo(data.expert);
            setMemberInfo(data.member);
        } catch (error) {
            console.error('Error fetching booking details:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!show) return null;

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'reserved':
            case 'pending': return 'client-booking-status-badge status-pending';
            case 'paied':
            case 'confirm': return 'client-booking-status-badge status-confirmed';
            case 'complete': return 'client-booking-status-badge status-completed';
            case 'cancle':
            case 'cancelled': return 'client-booking-status-badge status-cancelled';
            case 'failed': return 'client-booking-status-badge status-failed';
            default: return 'client-booking-status-badge status-pending';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'cancle':
            case 'cancelled': return 'bi-x-circle-fill';
            case 'failed': return 'bi-exclamation-circle-fill';
            case 'paied':
            case 'complete':
            case 'confirm': return 'bi-check-circle-fill';
            default: return 'bi-clock-fill';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'reserved': return 'Chờ thanh toán';
            case 'paied': return 'Đã thanh toán';
            case 'cancle':
            case 'cancelled': return 'Đã hủy';
            case 'failed': return 'Thanh toán thất bại';
            case 'complete': return 'Hoàn thành';
            case 'pending': return 'Chờ xác nhận';
            case 'confirm': return 'Đã xác nhận';
            default: return status;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatPrice = (price) => {
        if (!price && price !== 0) return '-';
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    const getInitials = (name) => {
        if (!name) return 'E';
        const parts = name.split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleJoinMeeting = () => {
        onClose();
        navigate(`/video-call/${booking.id_reverse || booking._id}`);
    };

    const isPaid = booking.status === 'paied' || booking.status === 'paid' || booking.status === 'confirm' || booking.status === 'complete';
    const canJoinMeeting = isPaid && isToday(booking.day_support);

    return (
        <div className="client-booking-modal-overlay" onClick={handleBackdropClick}>
            <div className="client-booking-modal-container">
                <div className="client-booking-modal-header">
                    <h3 className="client-booking-modal-title">
                        <i className="bi bi-calendar-event"></i>
                        Chi tiết lịch tư vấn
                    </h3>
                    <button className="client-booking-modal-close" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                </div>

                <div className="client-booking-modal-body">
                    {/* Status Badge */}
                    <div className="client-booking-status-section">
                        <span className={getStatusBadgeClass(booking.status)}>
                            <i className={`bi ${getStatusIcon(booking.status)}`}></i>
                            {getStatusText(booking.status)}
                        </span>
                    </div>

                    {/* Expert Info Card */}
                    {loading ? (
                        <div className="client-booking-loading">
                            <div className="spinner-border" role="status"></div>
                            <span>Đang tải thông tin...</span>
                        </div>
                    ) : (
                        <>
                            {expertInfo && (
                                <div className="client-booking-section-card">
                                    <div className="client-section-card-header">
                                        <span className="client-section-label">
                                            <i className="bi bi-person-badge"></i>
                                            Thông tin chuyên gia
                                        </span>
                                    </div>
                                    <div className="client-expert-card-content">
                                        <div className="client-expert-avatar-wrapper">
                                            {expertInfo.fileAvartarUrl ? (
                                                <img
                                                    src={expertInfo.fileAvartarUrl}
                                                    alt={expertInfo.name}
                                                    className="client-expert-avatar-img"
                                                />
                                            ) : (
                                                <div className="client-expert-avatar-placeholder">
                                                    {getInitials(expertInfo.name)}
                                                </div>
                                            )}
                                            <div className="client-verified-badge">
                                                <i className="bi bi-check-lg"></i>
                                            </div>
                                        </div>
                                        <div className="client-expert-details">
                                            <h4 className="client-expert-name">{expertInfo.name}</h4>
                                            {expertInfo.expertProfile?.major && (
                                                <p className="client-expert-specialization">
                                                    <i className="bi bi-mortarboard"></i>
                                                    {expertInfo.expertProfile.major}
                                                </p>
                                            )}
                                            {expertInfo.expertProfile?.teachAt && (
                                                <p className="client-expert-experience">
                                                    <i className="bi bi-briefcase"></i>
                                                    {expertInfo.expertProfile.teachAt}
                                                </p>
                                            )}
                                            {expertInfo.rating && (
                                                <div className="client-expert-rating">
                                                    <i className="bi bi-star-fill"></i>
                                                    <span>{expertInfo.rating}</span>
                                                    <span className="client-rating-count">({expertInfo.ratingCount || 0} đánh giá)</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Booking Info Card */}
                            <div className="client-booking-section-card">
                                <div className="client-section-card-header">
                                    <span className="client-section-label">
                                        <i className="bi bi-calendar-check"></i>
                                        Thông tin lịch hẹn
                                    </span>
                                </div>
                                <div className="client-booking-detail-row">
                                    <span className="client-detail-label">
                                        <i className="bi bi-calendar3"></i>
                                        Ngày hỗ trợ
                                    </span>
                                    <span className="client-detail-value">{formatDate(booking.day_support)}</span>
                                </div>
                                <div className="client-booking-detail-row">
                                    <span className="client-detail-label">
                                        <i className="bi bi-clock"></i>
                                        Thời gian
                                    </span>
                                    <span className="client-detail-value">
                                        {formatTime(booking.time_start)} - {formatTime(booking.time_end)}
                                    </span>
                                </div>
                                {booking.price_support && (
                                    <div className="client-booking-detail-row">
                                        <span className="client-detail-label">
                                            <i className="bi bi-currency-dollar"></i>
                                            Phí tư vấn
                                        </span>
                                        <span className="client-detail-value client-price-value">
                                            {formatPrice(booking.price_support)}
                                        </span>
                                    </div>
                                )}
                                <div className="client-booking-detail-row">
                                    <span className="client-detail-label">
                                        <i className="bi bi-hash"></i>
                                        Mã đặt lịch
                                    </span>
                                    <span className="client-booking-id">
                                        {booking.id_reverse || booking._id}
                                    </span>
                                </div>
                            </div>

                            {/* Member Info Card */}
                            {memberInfo && (
                                <div className="client-booking-section-card">
                                    <div className="client-section-card-header">
                                        <span className="client-section-label">
                                            <i className="bi bi-person"></i>
                                            Thông tin khách hàng
                                        </span>
                                    </div>
                                    <div className="client-booking-detail-row">
                                        <span className="client-detail-label">
                                            <i className="bi bi-person-circle"></i>
                                            Tên khách hàng
                                        </span>
                                        <span className="client-detail-value">{memberInfo.name || userInfo?.name}</span>
                                    </div>
                                    {memberInfo.email && (
                                        <div className="client-booking-detail-row">
                                            <span className="client-detail-label">
                                                <i className="bi bi-envelope"></i>
                                                Email
                                            </span>
                                            <span className="client-detail-value">{memberInfo.email}</span>
                                        </div>
                                    )}
                                    {memberInfo.phone && (
                                        <div className="client-booking-detail-row">
                                            <span className="client-detail-label">
                                                <i className="bi bi-telephone"></i>
                                                Số điện thoại
                                            </span>
                                            <span className="client-detail-value">{memberInfo.phone}</span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="client-booking-modal-footer">
                    {canJoinMeeting && (
                        <button className="btn btn-success" onClick={handleJoinMeeting}>
                            <i className="bi bi-camera-video"></i>
                            Tham gia cuộc họp
                        </button>
                    )}
                    <button className="btn btn-secondary" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
