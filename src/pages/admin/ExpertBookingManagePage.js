import React, { useEffect, useState } from 'react';
import '../../assets/css/ExpertBookingAdmin.css';
import { getExpertBookings, expertJoinBooking } from '../../services/expert-booking.api';
import { getUserById } from '../../services/expert.api';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import Loading from '../../components/Loading';

export default function ExpertBookingManagePage() {
    const [isLoading, setIsLoading] = useState(true);
    const [bookings, setBookings] = useState([]);
    const [filteredBookings, setFilteredBookings] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [memberInfo, setMemberInfo] = useState(null);
    const [loadingMember, setLoadingMember] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const [searchParam, setSearchParam] = useSearchParams();
    const page = parseInt(searchParam.get('page')) || 1;

    useEffect(() => {
        fetchBookings();
    }, [page]);

    useEffect(() => {
        if (searchTerm.trim() === '') {
            setFilteredBookings(bookings);
        } else {
            const filtered = bookings.filter(booking => 
                booking.id_member?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                booking.id_reverse?.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredBookings(filtered);
        }
    }, [searchTerm, bookings]);

    const fetchBookings = async () => {
        setIsLoading(true);
        try {
            const res = await getExpertBookings(page, 10);
            if (res?.data) {
                setBookings(res.data.result || []);
                setFilteredBookings(res.data.result || []);
                setTotalPage(res.data.totalPage || 0);
            }
        } catch (error) {
            console.error('Error fetching bookings:', error);
            toast.error('Không thể tải danh sách lịch đặt!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = async (booking) => {
        setSelectedBooking(booking);
        setShowDetailModal(true);
        setLoadingMember(true);
        setMemberInfo(null);

        try {
            const res = await getUserById(booking.id_member);
            if (res?.data?.data) {
                setMemberInfo(res.data.data);
            }
        } catch (error) {
            console.error('Error fetching member:', error);
            toast.error('Không thể tải thông tin khách hàng!');
        } finally {
            setLoadingMember(false);
        }
    };

    const handleCloseModal = () => {
        setShowDetailModal(false);
        setSelectedBooking(null);
        setMemberInfo(null);
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'reserved': { class: 'status-pending', text: 'Chờ thanh toán', icon: 'bi-circle-fill' },
            'paied': { class: 'status-paid', text: 'Đã thanh toán', icon: 'bi-check-circle-fill' },
            'cancle': { class: 'status-cancelled', text: 'Đã hủy', icon: 'bi-x-circle-fill' },
            'failed': { class: 'status-failed', text: 'Thanh toán thất bại', icon: 'bi-exclamation-circle-fill' },
            'complete': { class: 'status-completed', text: 'Hoàn thành', icon: 'bi-check-all' }
        };
        const s = statusMap[status] || { class: 'status-pending', text: status, icon: 'bi-circle-fill' };
        return (
            <span className={`status-badge ${s.class}`}>
                <i className={`bi ${s.icon}`}></i>
                {s.text}
            </span>
        );
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
        if (!name) return 'U';
        const parts = name.split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const handleChangePage = (newPage) => {
        const params = new URLSearchParams(searchParam.toString());
        params.set('page', newPage);
        setSearchParam(params);
    };

    const handleJoinMeeting = async () => {
        if (!selectedBooking?.meet_link) return;

        const bookingId = selectedBooking.id_reverse || selectedBooking._id;
        console.log(bookingId)
        try {
            await expertJoinBooking(bookingId);
            window.open(selectedBooking.meet_link, '_blank');
            handleCloseModal();
            fetchBookings();
        } catch (error) {
            console.error('Error joining meeting:', error);
            toast.error('Không thể tham gia cuộc họp!');
        }
    };

    const isPaid = selectedBooking?.status === 'paied' || selectedBooking?.status === 'paid' || selectedBooking?.status === 'confirm' || selectedBooking?.status === 'complete';

    const isBookingPassed = () => {
        if (!selectedBooking?.day_support) return false;
        const bookingDate = new Date(selectedBooking.day_support);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate < today;
    };

    const isBookingToday = () => {
        if (!selectedBooking?.day_support) return false;
        const bookingDate = new Date(selectedBooking.day_support);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        bookingDate.setHours(0, 0, 0, 0);
        return bookingDate.getTime() === today.getTime();
    };

    return (
        <div className="expert-booking-management">
            {/* Page Header */}
            <div className="booking-management-header">
                <div className="header-left">
                    <h1 className="page-title">
                        <i className="bi bi-calendar-check-fill"></i>
                        Lịch đặt chuyên gia
                    </h1>
                    <p className="page-subtitle">
                        Theo dõi và quản lý các lịch đặt tư vấn trong hệ thống.
                    </p>
                </div>
                <div className="header-right">
                    <div className="stat-card">
                        <div className="stat-icon">
                            <i className="bi bi-calendar-event"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{filteredBookings.length}</span>
                            <span className="stat-label">Lịch đặt</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="filter-bar">
                <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã đặt lịch, ID khách hàng..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bookings-table-container">
                {isLoading ? (
                    <Loading />
                ) : filteredBookings.length === 0 ? (
                    <div className="empty-state">
                        <i className="bi bi-calendar-x"></i>
                        <h3>Chưa có lịch đặt nào</h3>
                        <p>Danh sách lịch đặt sẽ hiển thị tại đây.</p>
                    </div>
                ) : (
                    <>
                        <table className="bookings-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã đặt lịch</th>
                                    <th>Ngày hỗ trợ</th>
                                    <th>Thời gian</th>
                                    <th>Phí tư vấn</th>
                                    <th>Trạng thái</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredBookings.map((booking, index) => (
                                    <tr key={booking._id || index}>
                                        <td className="stt-cell">{(page - 1) * 10 + index + 1}</td>
                                        <td>
                                            <span className="customer-id">{booking.id_reverse || booking._id}</span>
                                        </td>
                                        <td>
                                            <div className="date-wrapper">
                                                <i className="bi bi-calendar3"></i>
                                                {formatDate(booking.day_support)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="time-wrapper">
                                                <i className="bi bi-clock"></i>
                                                {formatTime(booking.time_start)} - {formatTime(booking.time_end)}
                                            </div>
                                        </td>
                                        <td>
                                            <span className="price-value">{formatPrice(booking.price_support)}</span>
                                        </td>
                                        <td>
                                            {getStatusBadge(booking.status)}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn-action btn-view"
                                                    title="Xem chi tiết"
                                                    onClick={() => handleViewDetail(booking)}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPage > 1 && (
                            <div className="pagination-wrapper">
                                <div className="pagination-info">
                                    Trang <strong>{page}</strong> / <strong>{totalPage}</strong>
                                </div>
                                <div className="pagination-buttons">
                                    <button
                                        className="btn-pagination"
                                        onClick={() => handleChangePage(page - 1)}
                                        disabled={page <= 1}
                                    >
                                        <i className="bi bi-chevron-left"></i>
                                        Trước
                                    </button>
                                    {Array.from({ length: totalPage }, (_, i) => i + 1).map(p => (
                                        <button
                                            key={p}
                                            className={`btn-pagination ${page === p ? 'active' : ''}`}
                                            onClick={() => handleChangePage(p)}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                    <button
                                        className="btn-pagination"
                                        onClick={() => handleChangePage(page + 1)}
                                        disabled={page >= totalPage}
                                    >
                                        Sau
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedBooking && (
                <div className="admin-booking-overlay" onClick={handleCloseModal}>
                    <div className="admin-booking-modal " onClick={(e) => e.stopPropagation()}>
                        <div className="admin-booking-header">
                            <h3>
                                <i className="bi bi-calendar-event"></i>
                                Chi tiết lịch đặt
                            </h3>
                            <button className="admin-booking-close" onClick={handleCloseModal}>
                                <i className="bi bi-x-lg"></i>
                            </button>
                        </div>

                        <div className="admin-booking-body">
                            {/* Booking Info */}
                            <div className="admin-booking-section">
                                <h4 className="admin-booking-section-title">
                                    <i className="bi bi-calendar-check"></i>
                                    Thông tin lịch hẹn
                                </h4>
                                <div className="admin-booking-row">
                                    <span className="admin-booking-label">Mã đặt lịch</span>
                                    <span className="admin-booking-value">{selectedBooking.id_reverse || selectedBooking._id}</span>
                                </div>
                                <div className="admin-booking-row">
                                    <span className="admin-booking-label">Ngày hỗ trợ</span>
                                    <span className="admin-booking-value">{formatDate(selectedBooking.day_support)}</span>
                                </div>
                                <div className="admin-booking-row">
                                    <span className="admin-booking-label">Thời gian</span>
                                    <span className="admin-booking-value">
                                        {formatTime(selectedBooking.time_start)} - {formatTime(selectedBooking.time_end)}
                                    </span>
                                </div>
                                <div className="admin-booking-row">
                                    <span className="admin-booking-label">Phí tư vấn</span>
                                    <span className="admin-booking-value price">{formatPrice(selectedBooking.price_support)}</span>
                                </div>
                                <div className="admin-booking-row">
                                    <span className="admin-booking-label">Trạng thái</span>
                                    <span className="admin-booking-value">{getStatusBadge(selectedBooking.status)}</span>
                                </div>
                                {selectedBooking.transaction_id && (
                                    <div className="admin-booking-row">
                                        <span className="admin-booking-label">Mã giao dịch</span>
                                        <span className="admin-booking-value transaction-id">{selectedBooking.transaction_id}</span>
                                    </div>
                                )}
                                {selectedBooking.payment_date && (
                                    <div className="admin-booking-row">
                                        <span className="admin-booking-label">Ngày thanh toán</span>
                                        <span className="admin-booking-value">{formatDate(selectedBooking.payment_date)}</span>
                                    </div>
                                )}
                                {selectedBooking.joinAt && (
                                    <div className="admin-booking-row">
                                        <span className="admin-booking-label">Đã tham gia lúc</span>
                                        <span className="admin-booking-value">{formatDate(selectedBooking.joinAt)} {formatTime(selectedBooking.joinAt)}</span>
                                    </div>
                                )}
                            </div>

                            {/* Customer Info */}
                            <div className="admin-booking-section">
                                <h4 className="admin-booking-section-title">
                                    <i className="bi bi-person"></i>
                                    Thông tin khách hàng
                                </h4>
                                {loadingMember ? (
                                    <div className="admin-booking-loading">
                                        <div className="spinner-border"></div>
                                        <span>Đang tải thông tin khách hàng...</span>
                                    </div>
                                ) : memberInfo ? (
                                    <>
                                        <div className="admin-booking-profile">
                                            <div className="admin-booking-avatar">
                                                {memberInfo.fileAvartarUrl ? (
                                                    <img src={memberInfo.fileAvartarUrl} alt={memberInfo.name} />
                                                ) : (
                                                    <div className="admin-booking-avatar-placeholder">
                                                        {getInitials(memberInfo.name)}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="admin-booking-info">
                                                <h5 className="admin-booking-info-name">{memberInfo.name || 'Khách hàng'}</h5>
                                                <p className="admin-booking-info-role">
                                                    <i className="bi bi-person-badge"></i>
                                                    {memberInfo.roleName === 'member' ? 'Khách hàng' : memberInfo.roleName}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="admin-booking-row">
                                            <span className="admin-booking-label">Email</span>
                                            <span className="admin-booking-value">{memberInfo.email || 'Không có'}</span>
                                        </div>
                                        {memberInfo.phone && (
                                            <div className="admin-booking-row">
                                                <span className="admin-booking-label">Số điện thoại</span>
                                                <span className="admin-booking-value">{memberInfo.phone}</span>
                                            </div>
                                        )}
                                        {memberInfo.username && (
                                            <div className="admin-booking-row">
                                                <span className="admin-booking-label">Username</span>
                                                <span className="admin-booking-value">{memberInfo.username}</span>
                                            </div>
                                        )}
                                        <div className="admin-booking-row">
                                            <span className="admin-booking-label">ID Khách hàng</span>
                                            <span className="admin-booking-value member-id">{memberInfo._id}</span>
                                        </div>
                                    </>
                                ) : (
                                    <div className="admin-booking-empty">
                                        <i className="bi bi-person-x"></i>
                                        <p>Không tìm thấy thông tin khách hàng</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="admin-booking-footer">
                            {isBookingPassed() ? (
                                <span className="badge badge-secondary">
                                    <i className="bi bi-clock-history"></i>
                                    Đã qua
                                </span>
                            ) :  isPaid && selectedBooking?.meet_link ? (
                                <button className="btn btn-success" onClick={handleJoinMeeting}>
                                    <i className="bi bi-camera-video"></i>
                                    Tham gia cuộc họp
                                </button>
                            ) : null}
                            <button className="btn btn-secondary" onClick={handleCloseModal}>
                                <i className="bi bi-x-lg"></i>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
