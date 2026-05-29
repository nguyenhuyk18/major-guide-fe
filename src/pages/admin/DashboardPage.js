import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/Dashboard.css';
import { getListUser } from '../../services/user-access.api';
import { getAllPosts } from '../../services/post.api';
import Loading from '../../components/Loading';

export default function DashboardPage() {
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [posts, setPosts] = useState([]);
    const [recentBookings, setRecentBookings] = useState([]);
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
            const [usersRes, postsRes] = await Promise.allSettled([
                getListUser('', '', '', '', '', ''),
                getAllPosts()
            ]);

            if (usersRes.status === 'fulfilled' && usersRes.value?.data) {
                const data = usersRes.value.data;
                const userList = Array.isArray(data) ? data : (data.result || []);
                setUsers(userList);
            }

            if (postsRes.status === 'fulfilled' && postsRes.value?.data) {
                const data = postsRes.value.data;
                const postList = Array.isArray(data) ? data : (data.result || []);
                setPosts(postList);
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
    const totalRevenue = 125000000; // placeholder
    const monthlyRevenue = 18500000;

    // Simulate recent bookings from users (since no dedicated API)
    const recentBookingsData = users.slice(0, 5).map((user, idx) => ({
        id_reverse: `BK${Date.now().toString().slice(-6)}${idx}`,
        name_expert: user.name || 'Chuyên gia ' + (idx + 1),
        avatar_expert: user.fileAvartarUrl || null,
        email_expert: user.email || 'expert@example.com',
        day_support: new Date(Date.now() - idx * 86400000 * 2).toISOString().split('T')[0],
        time_start: new Date(Date.now() - idx * 86400000 * 2 + 36000000).toISOString(),
        price_support: [200000, 350000, 500000, 150000, 400000][idx],
        status: ['paied', 'reserved', 'paied', 'complete', 'reserved'][idx]
    }));
    const totalBookings = 342 + recentBookingsData.length;
    const completedBookings = 198 + recentBookingsData.filter(b => b.status === 'paied' || b.status === 'complete').length;

    // Revenue chart data (last 7 months)
    const revenueData = [
        { month: 'T11', revenue: 8200000, bookings: 12 },
        { month: 'T12', revenue: 11200000, bookings: 18 },
        { month: 'T1', revenue: 9800000, bookings: 15 },
        { month: 'T2', revenue: 14500000, bookings: 22 },
        { month: 'T3', revenue: 16800000, bookings: 26 },
        { month: 'T4', revenue: 15200000, bookings: 24 },
        { month: 'T5', revenue: 18500000, bookings: 30 },
    ];
    const maxRevenue = Math.max(...revenueData.map(d => d.revenue));

    // Top experts (sorted by bookings)
    const topExperts = [...users]
        .filter(u => u.roleName === 'expert' || u.role === 'expert')
        .slice(0, 5)
        .map((u, idx) => ({
            name: u.name || 'Chuyên gia ' + (idx + 1),
            avatar: u.fileAvartarUrl || null,
            bookings: [28, 22, 18, 15, 12][idx],
            revenue: [5600000, 4400000, 3600000, 3000000, 2400000][idx]
        }));

    // Activity feed (simulated)
    const activities = [
        { type: 'booking', icon: 'bi-calendar-check', text: 'Lịch hẹn mới từ <strong>Nguyễn Văn Minh</strong>', time: '5 phút trước' },
        { type: 'payment', icon: 'bi-credit-card', text: 'Thanh toán thành công <strong>500.000đ</strong>', time: '12 phút trước' },
        { type: 'user', icon: 'bi-person-plus', text: 'Khách hàng mới <strong>Lê Thị Hương</strong> đăng ký', time: '28 phút trước' },
        { type: 'booking', icon: 'bi-calendar-check', text: 'Lịch hẹn từ <strong>Trần Đức Anh</strong> hoàn thành', time: '1 giờ trước' },
        { type: 'payment', icon: 'bi-credit-card', text: 'Thanh toán thành công <strong>350.000đ</strong>', time: '2 giờ trước' },
        { type: 'cancel', icon: 'bi-x-circle', text: 'Lịch hẹn <strong>BK-202412</strong> bị hủy', time: '3 giờ trước' },
    ];

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
                            +12%
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
                            +8%
                        </span>
                    </div>
                    <div className="stat-card-value">{totalBookings}</div>
                    <div className="stat-card-label">Lịch đặt</div>
                    <div className="stat-card-sublabel">{completedBookings} hoàn thành · {totalBookings - completedBookings} đang chờ</div>
                </div>

                {/* Revenue */}
                <div className="stat-card-wrapper revenue">
                    <div className="stat-card-top">
                        <div className="stat-card-icon">
                            <i className="bi bi-currency-dollar"></i>
                        </div>
                        <span className="stat-card-trend up">
                            <i className="bi bi-arrow-up"></i>
                            +18%
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
                            +5%
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
                                                    <span className="booking-expert-email">{booking.email_expert}</span>
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
                                    <div
                                        className="activity-text"
                                        dangerouslySetInnerHTML={{ __html: activity.text }}
                                    ></div>
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

                {/* System Status */}
                <div className="dashboard-section-card">
                    <div className="dashboard-section-header">
                        <h3>
                            <i className="bi bi-server"></i>
                            Trạng thái hệ thống
                        </h3>
                    </div>
                    <div className="system-status-list">
                        <div className="system-status-item">
                            <span className="system-status-name">
                                <span className="system-status-indicator online"></span>
                                API Gateway
                            </span>
                            <span className="system-status-value good">Online</span>
                        </div>
                        <div className="system-status-item">
                            <span className="system-status-name">
                                <span className="system-status-indicator online"></span>
                                Booking Service
                            </span>
                            <span className="system-status-value good">Online</span>
                        </div>
                        <div className="system-status-item">
                            <span className="system-status-name">
                                <span className="system-status-indicator online"></span>
                                User Service
                            </span>
                            <span className="system-status-value good">Online</span>
                        </div>
                        <div className="system-status-item">
                            <span className="system-status-name">
                                <span className="system-status-indicator warning"></span>
                                Email Service
                            </span>
                            <span className="system-status-value warn">Degraded</span>
                        </div>
                        <div className="system-status-item">
                            <span className="system-status-name">
                                <span className="system-status-indicator online"></span>
                                AI Chat Service
                            </span>
                            <span className="system-status-value good">Online</span>
                        </div>
                    </div>
                    <div className="system-status-list" style={{ paddingTop: '0.25rem' }}>
                        <div className="system-info-item">
                            <span className="system-info-name">Phiên bản</span>
                            <span className="system-info-value">v2.4.1</span>
                        </div>
                        <div className="system-info-item">
                            <span className="system-info-name">Uptime</span>
                            <span className="system-info-value">99.8%</span>
                        </div>
                        <div className="system-info-item">
                            <span className="system-info-name">Ngày cập nhật</span>
                            <span className="system-info-value">{new Date().toLocaleDateString('vi-VN')}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
