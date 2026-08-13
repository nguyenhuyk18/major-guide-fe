import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../services/notification.api';

const relativeTime = value => {
    const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
    if (seconds < 60) return 'Vừa xong';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} phút trước`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} giờ trước`;
    return new Date(value).toLocaleDateString('vi-VN');
};

export default function NotificationBell() {
    const auth = useSelector(state => state.authAdminReducer);
    const user = auth.loggedUser;
    const [open, setOpen] = useState(false);
    const [items, setItems] = useState([]);
    const [unread, setUnread] = useState(0);
    const [loading, setLoading] = useState(false);
    const wrapRef = useRef(null);
    const navigate = useNavigate();
    const userId = user?.id || user?._id;

    const load = async () => {
        setLoading(true);
        try { const response = await getNotifications(); const data = response?.data?.data || {}; setItems(data.result || []); setUnread(data.unreadCount || 0); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (userId) load(); }, [userId]); // eslint-disable-line react-hooks/exhaustive-deps
    useEffect(() => {
        const outside = event => { if (wrapRef.current && !wrapRef.current.contains(event.target)) setOpen(false); };
        document.addEventListener('mousedown', outside);
        return () => document.removeEventListener('mousedown', outside);
    }, []);
    useEffect(() => {
        if (!auth.access_token) return undefined;
        const socket = io(`${process.env.REACT_APP_API_URL}/notifications`, { path: '/socket.io', transports: ['websocket'], auth: { token: auth.access_token } });
        socket.on('notification:new', notification => { setItems(old => [notification, ...old.filter(item => (item.id || item._id) !== (notification.id || notification._id))].slice(0, 8)); setUnread(old => old + 1); });
        return () => socket.disconnect();
    }, [auth.access_token]);

    const isRead = item => item.recipientRole === 'admin' ? item.readBy?.includes(userId) : item.isRead;
    const openItem = async item => { if (!isRead(item)) { await markNotificationRead(item.id || item._id); setUnread(old => Math.max(0, old - 1)); } setOpen(false); navigate(item.actionUrl || '/admin'); };
    const readAll = async () => { await markAllNotificationsRead(); setItems(old => old.map(item => item.recipientRole === 'admin' ? { ...item, readBy: [...(item.readBy || []), userId] } : { ...item, isRead: true })); setUnread(0); };
    const icon = type => type === 'booking_paid' ? 'bi-calendar-check' : 'bi-calendar-plus';

    return <div className="notification-wrap" ref={wrapRef}>
        <button className="admin-notification" type="button" aria-label="Thông báo" onClick={() => { setOpen(value => !value); if (!open) load(); }}><i className="bi bi-bell" />{unread > 0 && <span className="notification-count">{unread > 99 ? '99+' : unread}</span>}</button>
        {open && <div className="notification-dropdown">
            <div className="notification-dropdown-head"><div><strong>Thông báo</strong><small>{unread} chưa đọc</small></div>{unread > 0 && <button onClick={readAll}>Đọc tất cả</button>}</div>
            <div className="notification-list">
                {loading && items.length === 0 && <div className="notification-empty">Đang tải...</div>}
                {!loading && items.length === 0 && <div className="notification-empty"><i className="bi bi-bell-slash" /><span>Chưa có thông báo</span></div>}
                {items.map(item => <button key={item.id || item._id} className={`notification-item ${!isRead(item) ? 'unread' : ''}`} onClick={() => openItem(item)}>
                    <span className={`notification-item-icon ${item.type}`}><i className={`bi ${icon(item.type)}`} /></span>
                    <span className="notification-item-copy"><strong>{item.title}</strong><span>{item.message}</span><small>{relativeTime(item.createdAt)}</small></span>
                    {!isRead(item) && <i className="notification-unread-dot" />}
                </button>)}
            </div>
            <button className="notification-footer" onClick={() => { setOpen(false); navigate('/admin/notifications'); }}>Xem tất cả thông báo <i className="bi bi-arrow-right" /></button>
        </div>}
    </div>;
}
