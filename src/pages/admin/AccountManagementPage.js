import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getListUser } from '../../services/user-access.api';
import '../../assets/css/AccountManagementPage.css';

const ROLE_LABELS = {
    admin: { label: 'Quản trị viên', cls: 'am-badge--admin' },
    expert: { label: 'Chuyên gia', cls: 'am-badge--expert' },
};

const STATUS_LABELS = {
    active:   { label: 'Hoạt động',       cls: 'am-badge--active'   },
    inactive: { label: 'Không hoạt động', cls: 'am-badge--inactive' },
    banned:   { label: 'Bị khóa',         cls: 'am-badge--banned'   },
    locked:   { label: 'Bị khóa',         cls: 'am-badge--banned'   },
};

const ROLE_FILTERS = [
    { value: '', label: 'Tất cả vai trò' },
    { value: 'admin', label: 'Quản trị viên' },
    { value: 'expert', label: 'Chuyên gia' },
];

const STATUS_FILTERS = [
    { value: '', label: 'Tất cả trạng thái' },
    { value: 'active', label: 'Hoạt động' },
    { value: 'inactive', label: 'Không hoạt động' },
    { value: 'banned', label: 'Bị khóa' },
];

const SORT_OPTIONS = [
    { value: 'newest', label: 'Mới nhất' },
    { value: 'oldest', label: 'Cũ nhất' },
    { value: 'name_asc', label: 'Tên A → Z' },
    { value: 'name_desc', label: 'Tên Z → A' },
];

const PAGE_SIZE = 5;

export default function AccountManagementPage() {
    const [searchParams, setSearchParams] = useSearchParams();

    const page = searchParams.get('page') || '1';
    const status = searchParams.get('status') || '';
    const role = searchParams.get('role') || 'expert';
    const name = searchParams.get('name') || '';
    const sort = searchParams.get('sort') || 'newest';

    const [accounts, setAccounts] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(true);
    const [detailAccount, setDetailAccount] = useState(null);
    const [showDetail, setShowDetail] = useState(false);

    // Fetch accounts
    useEffect(() => {
        const fetchAccounts = async () => {
            setLoading(true);
            try {
                const rs = await getListUser(page, status, name, PAGE_SIZE, sort, role);
                const data = rs?.data?.data;

                console.log('data', data);

                setAccounts(data?.result || []);
                setTotalPage(data?.totalPage || 0);
                setTotalCount(data?.total || 0);
            } catch (err) {
                console.error('Error fetching accounts:', err);
                setAccounts([]);
            } finally {
                setLoading(false);
            }
        };
        fetchAccounts();
    }, [page, status, role, name, sort]);

    // Update URL param helper
    const updateParam = (key, value) => {
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        next.set('page', '1'); // reset to page 1 on filter change
        setSearchParams(next);
    };

    const handleSearchChange = (val) => {
        const next = new URLSearchParams(searchParams);
        if (val) {
            next.set('name', val);
        } else {
            next.delete('name');
        }
        next.set('page', '1');
        setSearchParams(next);
    };

    const changePage = (newPage) => {
        const next = new URLSearchParams(searchParams);
        next.set('page', String(newPage));
        setSearchParams(next);
    };

    const openDetail = (account) => {
        setDetailAccount(account);
        setShowDetail(true);
    };

    const closeDetail = () => {
        setShowDetail(false);
        setDetailAccount(null);
    };

    const currentPage = Number(page || 1);

    // Stats
    const stats = {
        total: totalCount,
        active: accounts.filter(a => (a.statusAccount || a.status) === 'active').length,
        inactive: accounts.filter(a => {
            const s = a.statusAccount || a.status;
            return ['inactive', 'banned', 'locked'].includes(s);
        }).length,
    };

    const renderPagination = () => {
        if (totalPage <= 1) return null;
        const pages = [];
        for (let i = 1; i <= totalPage; i++) {
            pages.push(i);
        }
        return (
            <div className="am-pagination">
                <button
                    className="am-page-btn"
                    disabled={currentPage === 1}
                    onClick={() => changePage(currentPage - 1)}
                >
                    <i className="bi bi-chevron-left"></i>
                </button>
                {pages.map(p => (
                    <button
                        key={p}
                        className={`am-page-btn ${p === currentPage ? 'is-active' : ''}`}
                        onClick={() => changePage(p)}
                    >
                        {p}
                    </button>
                ))}
                <button
                    className="am-page-btn"
                    disabled={currentPage === totalPage}
                    onClick={() => changePage(currentPage + 1)}
                >
                    <i className="bi bi-chevron-right"></i>
                </button>
            </div>
        );
    };

    return (
        <div className="am-wrapper">
            {/* ── Header ── */}
            <div className="am-header">
                <div className="am-header-left">
                    <h1 className="am-title">Quản lý Tài khoản</h1>
                    <p className="am-subtitle">
                        {loading ? 'Đang tải...' : `Tổng cộng ${totalCount} tài khoản trong hệ thống`}
                    </p>
                </div>
                <button className="am-btn am-btn-primary">
                    <i className="bi bi-plus-lg"></i>
                    Thêm tài khoản
                </button>
            </div>

            {/* ── Stats Cards ── */}
            <div className="am-stats">
                <div className="am-stat-card">
                    <div className="am-stat-icon am-stat-icon--total">
                        <i className="bi bi-people-fill"></i>
                    </div>
                    <div className="am-stat-info">
                        <div className="am-stat-value">{loading ? '...' : stats.total}</div>
                        <div className="am-stat-label">Tổng tài khoản</div>
                    </div>
                </div>
                <div className="am-stat-card">
                    <div className="am-stat-icon am-stat-icon--active">
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <div className="am-stat-info">
                        <div className="am-stat-value">{loading ? '...' : stats.active}</div>
                        <div className="am-stat-label">Hoạt động</div>
                    </div>
                </div>
                <div className="am-stat-card">
                    <div className="am-stat-icon am-stat-icon--inactive">
                        <i className="bi bi-pause-circle-fill"></i>
                    </div>
                    <div className="am-stat-info">
                        <div className="am-stat-value">{loading ? '...' : stats.inactive}</div>
                        <div className="am-stat-label">Khóa / Không hoạt động</div>
                    </div>
                </div>
            </div>

            {/* ── Toolbar ── */}
            <div className="am-toolbar">
                <div className="am-toolbar-left">
                    <div className="am-search-box">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm theo tên hoặc email..."
                            defaultValue={name}
                            onChange={e => handleSearchChange(e.target.value)}
                            className="am-search-input"
                        />
                        {name && (
                            <button className="am-search-clear" onClick={() => handleSearchChange('')}>
                                <i className="bi bi-x"></i>
                            </button>
                        )}
                    </div>
                    <select
                        className="am-select"
                        value={role}
                        onChange={e => updateParam('role', e.target.value)}
                    >
                        {ROLE_FILTERS.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                    <select
                        className="am-select"
                        value={status}
                        onChange={e => updateParam('status', e.target.value)}
                    >
                        {STATUS_FILTERS.map(f => (
                            <option key={f.value} value={f.value}>{f.label}</option>
                        ))}
                    </select>
                </div>
                <div className="am-toolbar-right">
                    <select
                        className="am-select am-select--sm"
                        value={sort}
                        onChange={e => updateParam('sort', e.target.value)}
                    >
                        {SORT_OPTIONS.map(o => (
                            <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="am-table-card">
                <div className="am-table-scroll">
                    <table className="am-table">
                        <thead>
                            <tr>
                                <th>Người dùng</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Trạng thái</th>
                                <th>Ngày tạo</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="am-loading-cell">
                                        <div className="am-loading">
                                            <div className="am-spinner"></div>
                                            <span>Đang tải dữ liệu...</span>
                                        </div>
                                    </td>
                                </tr>
                            ) : accounts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="am-empty-cell">
                                        <div className="am-empty">
                                            <i className="bi bi-people-x"></i>
                                            <span>Không tìm thấy tài khoản nào.</span>
                                        </div>
                                    </td>
                                </tr>
                            ) :                             accounts.map(account => {
                                const roleKey = (account.roleName || account.role_name || account.role || '').toLowerCase();
                                const statusKey = account.statusAccount || account.status || '';
                                const rl = ROLE_LABELS[roleKey] || {};
                                const sl = STATUS_LABELS[statusKey] || {};
                                const avatarUrl = account.fileAvartarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(account.name || 'U')}&background=374151&color=9ca3af`;

                                return (
                                    <tr key={account._id || account.id}>
                                        <td>
                                            <div className="am-user-cell">
                                                <img src={avatarUrl} alt={account.name} className="am-avatar" />
                                                <div className="am-user-info">
                                                    <span className="am-user-name">{account.name || '—'}</span>
                                                    <span className="am-user-phone">{account.phone || account.phone_number || '—'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="am-cell-secondary">{account.email || '—'}</td>
                                        <td>
                                            <span className={`am-badge ${rl.cls || ''}`}>
                                                {rl.label || account.roleName || account.role_name || account.role || '—'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`am-badge am-badge--dot ${sl.cls || ''}`}>
                                                <i className="bi bi-circle-fill"></i>
                                                {sl.label || statusKey || '—'}
                                            </span>
                                        </td>
                                        <td className="am-cell-secondary">
                                            {account.createdAt
                                                ? new Date(account.createdAt).toLocaleDateString('vi-VN')
                                                : '—'}
                                        </td>
                                        <td>
                                            <div className="am-row-actions">
                                                {/* Xem chi tiết */}
                                                <button
                                                    className="am-action-btn"
                                                    title="Xem chi tiết"
                                                    onClick={() => openDetail(account)}
                                                >
                                                    <i className="bi bi-eye"></i>
                                                </button>

                                                {/* Khóa tài khoản — luôn hiện */}
                                                <button
                                                    className="am-action-btn am-action-btn--warning"
                                                    title="Khóa tài khoản"
                                                    onClick={() => {
                                                        console.log('Lock account:', account._id);
                                                    }}
                                                >
                                                    <i className="bi bi-lock-fill"></i>
                                                </button>

                                                {/* Mở khóa tài khoản — luôn hiện */}
                                                <button
                                                    className="am-action-btn am-action-btn--success"
                                                    title="Mở khóa tài khoản"
                                                    onClick={() => {
                                                        console.log('Unlock account:', account._id);
                                                    }}
                                                >
                                                    <i className="bi bi-unlock-fill"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {!loading && totalPage > 1 && (
                    <div className="am-table-footer">
                        <div className="am-page-info">
                            Trang <strong>{currentPage}</strong> / <strong>{totalPage}</strong>
                            &nbsp;·&nbsp;
                            <strong>{totalCount}</strong> tài khoản
                        </div>
                        {renderPagination()}
                    </div>
                )}
            </div>

            {/* ── Detail Modal ── */}
            {showDetail && detailAccount && (() => {
                const roleKey = (detailAccount.roleName || detailAccount.role_name || '').toLowerCase();
                const statusKey = detailAccount.statusAccount || detailAccount.status || '';
                const rl = ROLE_LABELS[roleKey] || {};
                const sl = STATUS_LABELS[statusKey] || {};
                const avatarUrl = detailAccount.fileAvartarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(detailAccount.name || 'U')}&background=374151&color=9ca3af&size=128`;
                return (
                    <div className="am-modal-overlay" onClick={closeDetail}>
                        <div className="am-modal" onClick={e => e.stopPropagation()}>
                            <div className="am-modal-header">
                                <h2 className="am-modal-title">Chi tiết tài khoản</h2>
                                <button className="am-modal-close" onClick={closeDetail}>
                                    <i className="bi bi-x-lg"></i>
                                </button>
                            </div>
                            <div className="am-modal-body">
                                <div className="am-modal-profile">
                                    <img src={avatarUrl} alt={detailAccount.name} className="am-modal-avatar" />
                                    <h3 className="am-modal-name">{detailAccount.name || '—'}</h3>
                                    <span className={`am-badge ${rl.cls || ''}`}>
                                        {rl.label || detailAccount.roleName || detailAccount.role_name || '—'}
                                    </span>
                                    <span className={`am-badge am-badge--dot ${sl.cls || ''}`}>
                                        <i className="bi bi-circle-fill"></i>
                                        {sl.label || statusKey || '—'}
                                    </span>
                                </div>
                                <div className="am-modal-fields">
                                    <div className="am-modal-field">
                                        <label className="am-modal-label">
                                            <i className="bi bi-envelope"></i>
                                            Email
                                        </label>
                                        <div className="am-modal-value">{detailAccount.email || '—'}</div>
                                    </div>
                                    <div className="am-modal-field">
                                        <label className="am-modal-label">
                                            <i className="bi bi-telephone"></i>
                                            Số điện thoại
                                        </label>
                                        <div className="am-modal-value">{detailAccount.phone || detailAccount.phone_number || '—'}</div>
                                    </div>
                                    <div className="am-modal-field">
                                        <label className="am-modal-label">
                                            <i className="bi bi-calendar3"></i>
                                            Ngày tạo
                                        </label>
                                        <div className="am-modal-value">
                                            {detailAccount.createdAt
                                                ? new Date(detailAccount.createdAt).toLocaleDateString('vi-VN', {
                                                      day: '2-digit',
                                                      month: 'long',
                                                      year: 'numeric',
                                                  })
                                                : '—'}
                                        </div>
                                    </div>
                                    <div className="am-modal-field">
                                        <label className="am-modal-label">
                                            <i className="bi bi-shield-check"></i>
                                            Vai trò
                                        </label>
                                        <div className="am-modal-value">{rl.label || detailAccount.roleName || detailAccount.role_name || '—'}</div>
                                    </div>
                                    <div className="am-modal-field">
                                        <label className="am-modal-label">
                                            <i className="bi bi-toggle-on"></i>
                                            Trạng thái
                                        </label>
                                        <div className="am-modal-value">{sl.label || statusKey || '—'}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="am-modal-footer">
                                <button className="am-btn am-btn-ghost" onClick={closeDetail}>Đóng</button>
                                <button className="am-btn am-btn-primary">
                                    <i className="bi bi-pencil-square"></i>
                                    Chỉnh sửa
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}
