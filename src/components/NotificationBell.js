import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notification.api';

const notificationId = item => item?.id || item?._id;

const relativeTime = value => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return date.toLocaleDateString('vi-VN');
};

const notificationIcon = type => {
    if (type === 'booking_paid') return 'bi-calendar2-check-fill';
    if (type === 'expert_schedule_registered') return 'bi-calendar2-plus-fill';
    return 'bi-bell-fill';
};

export default function NotificationBell() {
    const auth = useSelector(state => state.authAdminReducer);
    const userId = auth.loggedUser?.id || auth.loggedUser?._id;
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadError, setLoadError] = useState('');
    const [processingId, setProcessingId] = useState('');
    const wrapRef = useRef(null);
    const navigate = useNavigate();

    const load = async () => {
        if (!userId) return;
        setLoading(true);
        setLoadError('');
        try {
            const response = await getNotifications(1, 8, 'unread');
            const data = response?.data?.data || {};
            setItems(data.result || []);
            setUnread(Number(data.unreadCount) || 0);
        } catch (error) {
            console.error('Notification load failed:', error);
            setLoadError('Không thể tải thông báo lúc này.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { if (userId) load(); }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        const refresh = () => load();
        window.addEventListener('notifications:refresh', refresh);
        return () => window.removeEventListener('notifications:refresh', refresh);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    useEffect(() => {
        const outside = event => {
            if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false);
        };
        document.addEventListener('mousedown', outside);
        return () => document.removeEventListener('mousedown', outside);
    }, []);

    useEffect(() => {
        if (!auth.access_token) return undefined;
        const socket = io(`${process.env.REACT_APP_API_URL}/notifications`, {
            path: '/socket.io',
            transports: ['websocket'],
            auth: { token: auth.access_token }
        });

        const receiveNotification = notification => {
            const id = notificationId(notification);
            setItems(current => {
                const exists = current.some(item => notificationId(item) === id);
                if (!exists) setUnread(count => count + 1);
                return [notification, ...current.filter(item => notificationId(item) !== id)].slice(0, 8);
            });
        };

        socket.on('notification:new', receiveNotification);
        return () => {
            socket.off('notification:new', receiveNotification);
            socket.disconnect();
        };
    }, [auth.access_token]);

    const openItem = item => {
        const id = notificationId(item);
        if (!id || processingId) return;

        const destination = item.actionUrl || '/admin';
        setProcessingId(id);
        setItems(current => current.filter(notification => notificationId(notification) !== id));
        setUnread(count => Math.max(0, count - 1));
        setOpen(false);
        navigate(destination);

        markNotificationRead(id)
            .then(() => window.dispatchEvent(new Event('notifications:refresh')))
            .catch(error => {
                console.error('Mark notification read failed:', error);
                window.dispatchEvent(new Event('notifications:refresh'));
            })
            .finally(() => setProcessingId(''));
    };

    const readAll = async () => {
        try {
            await markAllNotificationsRead();
            setItems([]);
            setUnread(0);
        } catch (error) {
            console.error('Mark all notifications failed:', error);
            setLoadError('Không thể cập nhật thông báo lúc này.');
        }
    };

    const toggleDropdown = () => {
        setOpen(current => !current);
        if (!open) load();
    };

    return (
        <div className="notification-wrap" ref={wrapRef}>
            <button className={`admin-notification ${unread > 0 ? 'has-notification' : ''}`} type="button" aria-label={`Thông báo, ${unread} chưa đọc`} onClick={toggleDropdown}>
                <i className="bi bi-bell" />
                {unread > 0 && <span className="notification-count">{unread > 99 ? '99+' : unread}</span>}
            </button>

            {open && (
                <div className="notification-dropdown">
                    <div className="notification-dropdown-head">
                        <div className="notification-heading-icon"><i className="bi bi-bell-fill" /></div>
                        <div className="notification-heading-copy">
                            <strong>Thông báo mới</strong>
                            <small>{unread > 0 ? `${unread} thông báo chưa đọc` : 'Bạn đã xem hết thông báo'}</small>
                        </div>
                        {unread > 0 && <button type="button" onClick={readAll}><i className="bi bi-check2-all" /> Đọc tất cả</button>}
                    </div>

                    <div className="notification-list">
                        {loading && items.length === 0 && (
                            <div className="notification-empty notification-loading">
                                <span className="notification-spinner" />
                                <strong>Đang tải thông báo</strong>
                            </div>
                        )}
                        {!loading && loadError && items.length === 0 && (
                            <div className="notification-empty notification-error">
                                <span><i className="bi bi-wifi-off" /></span>
                                <strong>Chưa thể tải thông báo</strong>
                                <small>{loadError}</small>
                                <button type="button" onClick={load}>Thử lại</button>
                            </div>
                        )}
                        {!loading && !loadError && items.length === 0 && (
                            <div className="notification-empty">
                                <span><i className="bi bi-check2-circle" /></span>
                                <strong>Không có thông báo mới</strong>
                                <small>Các cập nhật mới sẽ xuất hiện tại đây.</small>
                            </div>
                        )}
                        {items.map(item => {
                            const id = notificationId(item);
                            return (
                                <button key={id} type="button" className="notification-item unread" disabled={processingId === id} onClick={() => openItem(item)}>
                                    <span className={`notification-item-icon ${item.type}`}><i className={`bi ${notificationIcon(item.type)}`} /></span>
                                    <span className="notification-item-copy">
                                        <span className="notification-item-title"><strong>{item.title}</strong><i /></span>
                                        <span>{item.message}</span>
                                        <small><i className="bi bi-clock" /> {relativeTime(item.createdAt)}</small>
                                    </span>
                                    <span className="notification-item-action">
                                        {processingId === id ? <span className="notification-mini-spinner" /> : <i className="bi bi-chevron-right" />}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    <button className="notification-footer" type="button" onClick={() => { setOpen(false); navigate('/admin/notifications'); }}>
                        <span><i className="bi bi-inbox" /> Xem lịch sử thông báo</span>
                        <i className="bi bi-arrow-right" />
                    </button>
                </div>
            )}
        </div>
    );
}
