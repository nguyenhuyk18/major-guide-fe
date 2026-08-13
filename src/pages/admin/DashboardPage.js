import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/Dashboard.css';
import { getListUser } from '../../services/user-access.api';
import { getAllPosts } from '../../services/post.api';
import { getBookingDashboard } from '../../services/expert-booking.api';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [dashboard, setDashboard] = useState({
        totalBookings: 0, paidBookings: 0, pendingBookings: 0, cancelledBookings: 0,
        totalRevenue: 0, monthlyRevenue: 0, revenueData: [], recentBookings: [], topExperts: []
    });
    const [loadError, setLoadError] = useState('');
    const [dateStr, setDateStr] = useState('');

    useEffect(() => {
        const now = new Date();
        setDateStr(now.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }));
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [usersRes, postsRes, bookingRes] = await Promise.allSettled([
                getListUser(1, '', '', 10000, '', ''),
                getAllPosts(),
                getBookingDashboard()
            ]);

            if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
                const data = usersRes.value.data?.data ?? usersRes.value.data;
                const userList = Array.isArray(data) ? data : (data?.result || []);
                setUsers(userList);
            }

            if (postsRes.status === 'fulfilled' && postsRes.value?.data) {
                const data = postsRes.value.data?.data ?? postsRes.value.data;
                const postList = Array.isArray(data) ? data : (data?.result || []);
                setPosts(postList);
            }
            if (bookingRes.status === 'fulfilled') {
                const data = bookingRes.value?.data?.data ?? bookingRes.value?.data;
                setDashboard(current => ({ ...current, ...(data || {}) }));
            } else {
                setLoadError('Không thể tải dữ liệu booking. Hãy kiểm tra Booking Service.');
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // ---- Computed Stats ----
    const totalUsers = users.length;
    const totalMembers = users.filter(u => u.roleName === 'member' || u.role === 'member').length;
    const totalExperts = users.filter(u => u.roleName === 'expert' || u.role === 'expert').length;
    const totalPosts = posts.length;
    const totalRevenue = dashboard.totalRevenue || 0;
    const monthlyRevenue = dashboard.monthlyRevenue || 0;
    const recentBookingsData = dashboard.recentBookings || [];
    const totalBookings = dashboard.totalBookings || 0;
    const completedBookings = dashboard.paidBookings || 0;
    const revenueData = dashboard.revenueData || [];
    const maxRevenue = Math.max(1, ...revenueData.map(d => d.revenue || 0));
    const topExperts = dashboard.topExperts || [];
    const activities = recentBookingsData.map(booking => ({
        type: booking.status === 'paied' ? 'payment' : booking.status === 'cancle' || booking.status === 'failed' ? 'cancel' : 'booking',
        icon: booking.status === 'paied' ? 'bi-credit-card' : booking.status === 'cancle' || booking.status === 'failed' ? 'bi-x-circle' : 'bi-calendar-check',
        text: `${booking.name_customer || 'Học viên'} · ${{ paied: 'Đã thanh toán', reserved: 'Chờ thanh toán', cancle: 'Đã hủy', failed: 'Thất bại' }[booking.status] || booking.status}`,
        detail: booking.id_reverse,
        time: new Date(booking.createdAt || booking.day_support).toLocaleDateString('vi-VN')
    }));

    const formatPrice = (price) => {
        if (!price && price !== 0) return '-';
        return new Intl.NumberFormat('vi-VN').format(price) + ' đ';
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getInitials = (name) => {
        if (!name) return 'E';
        const parts = name.split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const getStatusText = (status) => {
        const map = {
            'paied': 'Đã thanh toán',
            'reserved': 'Chờ thanh toán',
            'complete': 'Hoàn thành',
            'cancle': 'Đã hủy',
            'failed': 'Thất bại'
        };
        return map[status] || status;
    };

    if (loading) {
        return (
            <div className="dashboard-page">
                <div className="dashboard-loading">
                    <div className="dashboard-skeleton dashboard-skeleton-title"></div>
                    <div className="dashboard-skeleton-stats">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="dashboard-skeleton-stat"></div>
                        ))}
                    </div>
                    <div className="dashboard-skeleton dashboard-skeleton-chart"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            {loadError && <div className="alert alert-warning mb-3">{loadError}</div>}
            {/* Header */}
            <div className="dashboard-header">
                <div className="dashboard-header-left">
                    <h1>
                        <i className="bi bi-grid-fill"></i>
                        Tổng quan
                    </h1>
                    <p>Xin chào! Đây là bảng điều khiển hệ thống Major Guide.</p>
                </div>
                <div className="dashboard-header-right">
                    <div className="dashboard-date-badge">
                        <i className="bi bi-calendar3"></i>
                        {dateStr}
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="dashboard-stats-grid">
                {/* Users */}
                <div className="stat-card-wrapper users">
                    <div className="stat-card-top">
                        <div className="stat-card-icon">
                            <i className="bi bi-people-fill"></i>
                        </div>
                        <span className="stat-card-trend up">
                            <i className="bi bi-arrow-up"></i>
                            API
                        </span>
                    </div>
                    <div className="stat-card-value">{totalUsers.toLocaleString()}</div>
                    <div className="stat-card-label">Người dùng</div>
                    <div className="stat-card-sublabel">{totalMembers.toLocaleString()} khách hàng · {totalExperts} chuyên gia</div>
                </div>

                {/* Bookings */}
                <div className="stat-card-wrapper bookings">
                    <div className="stat-card-top">
                        <div className="stat-card-icon">
                            <i className="bi bi-calendar-event"></i>
                        </div>
                        <span className="stat-card-trend up">
                            <i className="bi bi-arrow-up"></i>
                            {totalBookings ? Math.round((completedBookings / totalBookings) * 100) : 0}% đã trả
                        </span>
                    </div>
                    <div className="stat-card-value">{totalBookings}</div>
                    <div className="stat-card-label">Lịch đặt</div>
                    <div className="stat-card-sublabel">{completedBookings} đã thanh toán · {dashboard.pendingBookings || 0} đang chờ</div>
                </div>

                {/* Revenue */}
                <div className="stat-card-wrapper revenue">
                    <div className="stat-card-top">
                        <div className="stat-card-icon">
                            <i className="bi bi-currency-dollar"></i>
                        </div>
                        <span className="stat-card-trend up">
                            <i className="bi bi-arrow-up"></i>
                            Stripe
                        </span>
                    </div>
                    <div className="stat-card-value">{formatPrice(totalRevenue).replace(' đ', '')}</div>
                    <div className="stat-card-label">Doanh thu</div>
                    <div className="stat-card-sublabel">Tháng này: {formatPrice(monthlyRevenue)}</div>
                </div>

                {/* Experts */}
                <div className="stat-card-wrapper experts">
                    <div className="stat-card-top">
                        <div className="stat-card-icon">
                            <i className="bi bi-person-badge-fill"></i>
                        </div>
                        <span className="stat-card-trend up">
                            <i className="bi bi-arrow-up"></i>
                            API
                        </span>
                    </div>
                    <div className="stat-card-value">{totalExperts}</div>
                    <div className="stat-card-label">Chuyên gia</div>
                    <div className="stat-card-sublabel">{totalPosts} bài viết đã đăng</div>
                </div>
            </div>

            {/* Main Grid */}
            <div className="dashboard-main-grid">
                {/* Left: Recent Bookings */}
                <div className="dashboard-section-card">
                    <div className="dashboard-section-header">
                        <h3>
                            <i className="bi bi-calendar-check"></i>
                            Lịch đặt gần đây
                        </h3>
                        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                            <span className="dashboard-section-badge">{recentBookingsData.length} lịch</span>
                            <Link to="/admin/expert-bookings" className="dashboard-see-all-btn">
                                Xem tất cả
                                <i className="bi bi-chevron-right"></i>
                            </Link>
                        </div>
                    </div>
                    <div className="dashboard-bookings-table-container" style={{ overflowX: 'auto' }}>
                        <table className="dashboard-bookings-table">
                            <thead>
                                <tr>
                                    <th>Chuyên gia</th>
                                    <th>Mã đặt lịch</th>
                                    <th>Ngày / Giờ</th>
                                    <th>Phí tư vấn</th>
                                    <th>Trạng thái</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentBookingsData.map((booking, index) => (
                                    <tr key={index}>
                                        <td>
                                            <div className="booking-expert-cell">
                                                <div className="booking-expert-avatar">
                                                    {booking.avatar_expert ? (
                                                        <img src={booking.avatar_expert} alt={booking.name_expert} />
                                                    ) : (
                                                        getInitials(booking.name_expert)
                                                    )}
                                                </div>
                                                <div className="booking-expert-info">
                                                    <span className="booking-expert-name">{booking.name_expert}</span>
                                                    <span className="booking-expert-email">Học viên: {booking.name_customer || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="booking-id-cell">{booking.id_reverse}</span>
                                        </td>
                                        <td>
                                            <div className="booking-date-cell">
                                                <span className="date">{formatDate(booking.day_support)}</span>
                                                <span className="time">{formatTime(booking.time_start)}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="booking-price-cell">{formatPrice(booking.price_support)}</span>
                                        </td>
                                        <td>
                                            <span className={`booking-status-dot ${booking.status}`}>
                                                {getStatusText(booking.status)}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {recentBookingsData.length === 0 && (
                                    <tr><td colSpan="5"><div className="dashboard-empty"><i className="bi bi-calendar-x" /><p>Chưa có lịch đặt nào</p></div></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Right: Top Experts + Activity */}
                <div className="dashboard-right-col">
                    {/* Revenue Mini Chart */}
                    <div className="dashboard-section-card">
                        <div className="dashboard-section-header">
                            <h3>
                                <i className="bi bi-bar-chart-fill"></i>
                                Doanh thu 7 tháng
                            </h3>
                        </div>
                        <div className="revenue-chart-wrapper">
                            <div className="revenue-summary">
                                <div>
                                    <div className="revenue-summary-value">{formatPrice(monthlyRevenue)}</div>
                                    <div className="revenue-summary-label">Doanh thu tháng này</div>
                                </div>
                                <div className="revenue-summary-period">
                                    <i className="bi bi-calendar-range"></i>
                                    7 tháng gần nhất
                                </div>
                            </div>
                            <div className="revenue-bars-container">
                                {revenueData.map((item, idx) => (
                                    <div className="revenue-bar-group" key={idx}>
                                        <div className="revenue-bar-group-inner">
                                            <div
                                                className="revenue-bar primary"
                                                style={{ height: `${(item.revenue / maxRevenue) * 100}%`, minHeight: item.revenue > 0 ? '8px' : '0' }}
                                                title={formatPrice(item.revenue)}
                                            >
                                                <span className="revenue-bar-value">{formatPrice(item.revenue)}</span>
                                            </div>
                                        </div>
                                        <span className="revenue-bar-label">{item.month}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Top Experts */}
                    <div className="dashboard-section-card">
                        <div className="dashboard-section-header">
                            <h3>
                                <i className="bi bi-star-fill"></i>
                                Top chuyên gia
                            </h3>
                            <Link to="/admin/experts" className="dashboard-see-all-btn">
                                Quản lý
                                <i className="bi bi-chevron-right"></i>
                            </Link>
                        </div>
                        <div className="top-experts-list">
                            {topExperts.length > 0 ? (
                                topExperts.map((expert, idx) => (
                                    <div className="top-expert-item" key={idx}>
                                        <span className={`top-expert-rank rank-${idx < 3 ? idx + 1 : 'other'}`}>
                                            {idx + 1}
                                        </span>
                                        <div className="top-expert-avatar">
                                            {expert.avatar ? (
                                                <img src={expert.avatar} alt={expert.name} />
                                            ) : (
                                                getInitials(expert.name)
                                            )}
                                        </div>
                                        <div className="top-expert-info">
                                            <div className="top-expert-name">{expert.name}</div>
                                            <div className="top-expert-stats">
                                                <span className="top-expert-stat-value">{expert.bookings} lịch</span>
                                                {' · '}
                                                <span className="top-expert-stat-value">{formatPrice(expert.revenue)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="dashboard-empty">
                                    <i className="bi bi-person-x"></i>
                                    <p>Chưa có chuyên gia nào</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Grid */}
            <div className="dashboard-bottom-grid">
                {/* Activity Feed */}
                <div className="dashboard-section-card">
                    <div className="dashboard-section-header">
                        <h3>
                            <i className="bi bi-activity"></i>
                            Hoạt động gần đây
                        </h3>
                        <span className="dashboard-section-badge">{activities.length} sự kiện</span>
                    </div>
                    <div className="activity-feed">
                        {activities.map((activity, idx) => (
                            <div className="activity-item" key={idx}>
                                <div className={`activity-icon-wrapper ${activity.type}`}>
                                    <i className={`bi ${activity.icon}`}></i>
                                </div>
                                <div className="activity-content">
                                    <div className="activity-text">{activity.text}</div>
                                    <div className="booking-id-cell">{activity.detail}</div>
                                    <div className="activity-time">{activity.time}</div>
                                </div>
                                <div className="activity-dot"></div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="dashboard-section-card">
                    <div className="dashboard-section-header">
                        <h3>
                            <i className="bi bi-lightning-fill"></i>
                            Thao tác nhanh
                        </h3>
                    </div>
                    <div className="quick-actions-grid">
                        <Link to="/admin/experts" className="quick-action-btn">
                            <i className="bi bi-person-plus"></i>
                            <span className="action-label">Thêm chuyên gia</span>
                        </Link>
                        <Link to="/admin/posts" className="quick-action-btn">
                            <i className="bi bi-file-earmark-plus"></i>
                            <span className="action-label">Viết bài mới</span>
                        </Link>
                        <Link to="/admin/subcribe-register" className="quick-action-btn">
                            <i className="bi bi-calendar-plus"></i>
                            <span className="action-label">Duyệt đăng ký</span>
                        </Link>
                        <Link to="/admin/account" className="quick-action-btn">
                            <i className="bi bi-person-gear"></i>
                            <span className="action-label">Quản lý tài khoản</span>
                        </Link>
                        <Link to="/admin/schedule-review" className="quick-action-btn">
                            <i className="bi bi-card-checklist"></i>
                            <span className="action-label">Duyệt lịch đăng ký</span>
                        </Link>
                        <Link to="/admin/register" className="quick-action-btn">
                            <i className="bi bi-calendar-week"></i>
                            <span className="action-label">Quản lý lịch</span>
                        </Link>
                    </div>
                </div>

                {/* Real booking status distribution */}
                <div className="dashboard-section-card">
                    <div className="dashboard-section-header">
                        <h3>
                            <i className="bi bi-pie-chart-fill"></i>
                            Trạng thái lịch đặt
                        </h3>
                    </div>
                    <div className="system-status-list">
                        <div className="system-status-item">
                            <span className="system-status-name">
                                <span className="system-status-indicator online"></span>
                                Đã thanh toán
                            </span>
                            <span className="system-status-value good">{dashboard.paidBookings || 0}</span>
                        </div>
                        <div className="system-status-item">
                            <span className="system-status-name">
                                <span className="system-status-indicator warning"></span>
                                Chờ thanh toán
                            </span>
                            <span className="system-status-value warn">{dashboard.pendingBookings || 0}</span>
                        </div>
                        <div className="system-status-item">
                            <span className="system-status-name">
                                <span className="system-status-indicator"></span>
                                Đã hủy / thất bại
                            </span>
                            <span className="system-status-value">{dashboard.cancelledBookings || 0}</span>
                        </div>
                    </div>
                    <div className="system-status-list" style={{ paddingTop: '0.25rem' }}>
                        <div className="system-info-item">
                            <span className="system-info-name">Tổng số lịch</span>
                            <span className="system-info-value">{totalBookings}</span>
                        </div>
                        <div className="system-info-item">
                            <span className="system-info-name">Cập nhật lúc</span>
                            <span className="system-info-value">{new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
