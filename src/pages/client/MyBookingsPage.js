import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import '../../assets/css/MyBookingsPage.css';
import { getAllBooking } from '../../services/booking.api';
import { createLinkPayment } from '../../services/payment.api';
import { getUserById } from '../../services/expert.api';
import BookingDetailModal from '../../components/BookingDetailModal';
import { isToday, isTodayOrFuture } from '../../helpers/date';

export default function MyBookingsPage() {
    const userInfo = useSelector(state => state.authClientReducer.loggedUser);
    const isLogin = useSelector(state => state.authClientReducer.isLogin);

    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [filterStatus, setFilterStatus] = useState('all');
    const [processingPayment, setProcessingPayment] = useState(null);
    const [expertsCache, setExpertsCache] = useState({});

    useEffect(() => {
        if (!isLogin) {
            toast.error('Vui lòng đăng nhập để xem lịch đặt!');
            navigate('/');
            return;
        }
        fetchBookings();
    }, [isLogin, navigate]);

    useEffect(() => {
        if (searchParams.get('payment') === 'cancelled') {
            toast.info('Bạn đã huỷ thanh toán Stripe. Lịch vẫn được giữ nếu chưa hết hạn.');
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, setSearchParams]);

    const fetchBookings = async () => {
        if (!userInfo?.id) return;
        try {
            const res = await getAllBooking(userInfo.id);
            
            // console.log('res', res);
            if (res?.data) {
                const data = res.data;
                let bookingArray;
                
                if (Array.isArray(data)) {
                    bookingArray = data;
                } else {
                    bookingArray = Object.keys(data)
                        .filter(key => key.match(/^[0-9]+$/))
                        .map(key => data[key]);
                }
                
                const sortedBookings = bookingArray.sort((a, b) => {
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });
                setBookings(sortedBookings);
                
                // Fetch expert info for each booking
                const uniqueExpertIds = [...new Set(sortedBookings.map(b => b.id_expert).filter(Boolean))];
                const expertsData = {};
                
                await Promise.all(
                    uniqueExpertIds.map(async (expertId) => {
                        if (!expertsCache[expertId]) {
                            try {
                                const expertRes = await getUserById(expertId);
                                if (expertRes?.data?.data) {
                                    expertsData[expertId] = expertRes.data.data;
                                }
                            } catch (err) {
                                console.error('Error fetching expert:', err);
                            }
                        }
                    })
                );
                
                setExpertsCache(prev => ({ ...prev, ...expertsData }));
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Không thể tải danh sách lịch đặt!');
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
    };

    const handlePayment = async (booking) => {
        // console.log(booking)
        try {
            
            setProcessingPayment(booking._id);
            
            const res = await createLinkPayment(booking.id_reverse);
            const { checkoutUrl } = res?.data?.data || {};
            // console.log(res);
            
            if (checkoutUrl) {
                toast.success('Đang chuyển đến Stripe Checkout...');
                window.location.assign(checkoutUrl);
            } else {
                toast.error('Không thể tạo link thanh toán!');
            }
        } catch (err) {
            console.error('Payment error:', err);
            toast.error(err?.response?.data?.message || 'Không thể tạo phiên Stripe Checkout. Vui lòng thử lại!');
        } finally {
            setProcessingPayment(null);
        }
    };

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
            case 'failed': return 'Thanh toán thất bại';
            default: return status;
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'short',
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

    const formatPrice = (price) => {
        if (!price && price !== 0) return '';
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    const getInitials = (name) => {
        if (!name) return 'E';
        const parts = name.split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const filteredBookings = (() => {
        if (filterStatus === 'all') return bookings;
        if (filterStatus === 'upcoming') {
            // Lịch tư vấn sắp tới: đã thanh toán + ngày hôm nay hoặc tương lai.
            return bookings.filter(b => {
                const isPaid = b.status === 'paied';
                return isPaid && isTodayOrFuture(b.day_support);
            });
        }
        return bookings.filter(b => b.status === filterStatus);
    })();

    const statusCounts = {
        all: bookings.length,
        reserved: bookings.filter(b => b.status === 'reserved').length,
        paied: bookings.filter(b => b.status === 'paied').length,
        cancle: bookings.filter(b => b.status === 'cancle').length,
        failed: bookings.filter(b => b.status === 'failed').length,
        upcoming: bookings.filter(b => {
            const isPaid = b.status === 'paied';
            return isPaid && isTodayOrFuture(b.day_support);
        }).length,
    };

    return (
        <div className="my-bookings-page">
            <div className="container bookings-container">
                <section className="bookings-hero">
                    <div className="bookings-hero-content">
                        <span className="bookings-eyebrow">
                            <i className="bi bi-stars"></i>
                            Không gian tư vấn của bạn
                        </span>
                        <h1 className="page-title">Lịch tư vấn</h1>
                        <p className="page-subtitle">
                            Theo dõi lịch hẹn, thanh toán và tham gia buổi tư vấn đúng giờ.
                        </p>
                    </div>
                    <Link to="/experts" className="bookings-new-button">
                        <i className="bi bi-plus-lg"></i>
                        Đặt lịch mới
                    </Link>
                    <div className="bookings-summary" aria-label="Tổng quan lịch tư vấn">
                        <div className="summary-item">
                            <span className="summary-icon summary-icon-blue"><i className="bi bi-calendar2-check"></i></span>
                            <span><strong>{statusCounts.all}</strong><small>Tổng lịch hẹn</small></span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-icon summary-icon-green"><i className="bi bi-calendar-event"></i></span>
                            <span><strong>{statusCounts.upcoming}</strong><small>Lịch sắp tới</small></span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-icon summary-icon-amber"><i className="bi bi-credit-card"></i></span>
                            <span><strong>{statusCounts.reserved}</strong><small>Chờ thanh toán</small></span>
                        </div>
                    </div>
                </section>

                <div className="bookings-toolbar">
                    <div className="bookings-toolbar-title">
                        <strong>Danh sách lịch hẹn</strong>
                        <span>{filteredBookings.length} lịch</span>
                    </div>
                    <div className="bookings-filters">
                    <div className="filter-tabs">
                        <button
                            className={`filter-tab ${filterStatus === 'all' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('all')}
                        >
                            Tất cả
                            <span className="filter-count">{statusCounts.all}</span>
                        </button>
                        <button
                            className={`filter-tab ${filterStatus === 'reserved' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('reserved')}
                        >
                            <i className="bi bi-clock"></i>
                            Chờ thanh toán
                            <span className="filter-count">{statusCounts.reserved}</span>
                        </button>
                        <button
                            className={`filter-tab ${filterStatus === 'paied' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('paied')}
                        >
                            <i className="bi bi-check-circle"></i>
                            Đã thanh toán
                            <span className="filter-count">{statusCounts.paied}</span>
                        </button>
                        <button
                            className={`filter-tab ${filterStatus === 'upcoming' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('upcoming')}
                            data-status="upcoming"
                        >
                            <i className="bi bi-calendar-event"></i>
                            Lịch sắp tới
                            <span className="filter-count">{statusCounts.upcoming}</span>
                        </button>
                        <button
                            className={`filter-tab ${filterStatus === 'cancle' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('cancle')}
                        >
                            <i className="bi bi-x-circle"></i>
                            Đã hủy
                            <span className="filter-count">{statusCounts.cancle}</span>
                        </button>
                        <button
                            className={`filter-tab ${filterStatus === 'failed' ? 'active' : ''}`}
                            onClick={() => setFilterStatus('failed')}
                        >
                            <i className="bi bi-exclamation-circle"></i>
                            Thất bại
                            <span className="filter-count">{statusCounts.failed}</span>
                        </button>
                    </div>
                    </div>
                </div>

                {loading ? (
                    <div className="bookings-loading">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <span>Đang tải danh sách lịch đặt...</span>
                    </div>
                ) : filteredBookings.length === 0 ? (
                    <div className="bookings-empty">
                        <div className="empty-icon">
                            <i className="bi bi-calendar-x"></i>
                        </div>
                        <h3>Chưa có lịch đặt nào</h3>
                        <p>
                            {filterStatus === 'upcoming' 
                                ? 'Không có lịch tư vấn sắp tới. Đặt lịch ngay để được tư vấn!'
                                : 'Hãy đặt lịch tư vấn với chuyên gia để bắt đầu hành trình của bạn!'}
                        </p>
                        <Link to="/experts" className="btn btn-primary">
                            <i className="bi bi-search"></i>
                            Tìm chuyên gia
                        </Link>
                    </div>
                ) : (
                    <div className="bookings-grid">
                        {filteredBookings.map((booking, index) => (
                            <div 
                                key={booking._id || index} 
                                className={`booking-card ${booking.status === 'cancle' ? 'is-cancelled' : ''} ${booking.status === 'failed' ? 'is-failed' : ''}`}
                            >
                                <div className="booking-card-header">
                                    <div className="booking-status">
                                        <span className={`status-badge ${getStatusBadgeClass(booking.status)}`}>
                                            <i className={`bi ${
                                                booking.status === 'cancle' ? 'bi-x-circle' :
                                                booking.status === 'paied' ? 'bi-check-circle-fill' :
                                                booking.status === 'failed' ? 'bi-exclamation-circle' :
                                                'bi-clock'
                                            }`}></i>
                                            {getStatusText(booking.status)}
                                        </span>
                                    </div>
                                    <span className="booking-date">
                                        <i className="bi bi-calendar3"></i>
                                        {formatDate(booking.day_support)}
                                    </span>
                                </div>

                                <div className="booking-card-body">
                                    <div className="booking-expert-row">
                                        <div className="expert-avatar-medium">
                                            {expertsCache[booking.id_expert]?.fileAvartarUrl ? (
                                                <img src={expertsCache[booking.id_expert].fileAvartarUrl} alt="Expert" />
                                            ) : (
                                                <div className="avatar-placeholder-medium">
                                                    {getInitials(expertsCache[booking.id_expert]?.name || booking.name_expert)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="expert-info">
                                            <span className="expert-name">
                                                {expertsCache[booking.id_expert]?.name || booking.name_expert || 'Chuyên gia'}
                                            </span>
                                            {expertsCache[booking.id_expert]?.expertProfile?.major && (
                                                <span className="expert-specialty">
                                                    <i className="bi bi-mortarboard"></i>
                                                    {expertsCache[booking.id_expert].expertProfile.major}
                                                </span>
                                            )}
                                            {expertsCache[booking.id_expert]?.expertProfile?.teachAt && (
                                                <span className="expert-exp-badge">
                                                    <i className="bi bi-briefcase"></i>
                                                    {expertsCache[booking.id_expert].expertProfile.teachAt}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="booking-details-grid">
                                        <div className="detail-item">
                                            <i className="bi bi-clock"></i>
                                            <span>Thời gian</span>
                                            <strong>{formatTime(booking.time_start)} - {formatTime(booking.time_end)}</strong>
                                        </div>
                                        <div className="detail-item">
                                            <i className="bi bi-currency-dollar"></i>
                                            <span>Phí tư vấn</span>
                                            <strong className="price-text">{formatPrice(booking.price_support)}</strong>
                                        </div>
                                    </div>

                                    {booking.id_reverse && (
                                        <div className="booking-id-row">
                                            <i className="bi bi-hash"></i>
                                            <span>Mã đặt lịch:</span>
                                            <code>{booking.id_reverse}</code>
                                        </div>
                                    )}
                                </div>

                                <div className="booking-card-footer">
                                    {booking.status === 'paied' && isToday(booking.day_support) && (
                                        <button
                                            className="booking-action booking-action-join"
                                            onClick={() => navigate(`/video-call/${booking.id_reverse || booking._id}`)}
                                        >
                                            <i className="bi bi-camera-video"></i>

                                            
                                            Tham gia cuộc họp
                                        </button>
                                    )}
                                    {booking.status === 'reserved' && (
                                        <button
                                            className="booking-action booking-action-payment"
                                            onClick={() => handlePayment(booking)}
                                            disabled={processingPayment === booking._id}
                                        >
                                            {processingPayment === booking._id ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-1"></span>
                                                    Đang xử lý...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="bi bi-credit-card"></i>
                                                    Thanh toán bằng thẻ
                                                </>
                                            )}
                                        </button>
                                    )}
                                    <button
                                        className="booking-action booking-action-detail"
                                        onClick={() => handleViewDetail(booking)}
                                    >
                                        <i className="bi bi-eye"></i>
                                        Chi tiết
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {selectedBooking && (
                <BookingDetailModal
                    booking={selectedBooking}
                    show={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedBooking(null);
                    }}
                    onPayment={handlePayment}
                />
            )}
        </div>
    );
}
