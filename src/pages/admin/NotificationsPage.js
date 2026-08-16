import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getNotifications, markAllNotificationsRead, markNotificationRead } from '../../services/notification.api';
import '../../assets/css/NotificationsPage.css';

export default function NotificationsPage() {
    const [params, setParams] = useSearchParams();
    const [data, setData] = useState({ result: [], totalPage: 0, unreadCount: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const user = useSelector(state => state.authAdminReducer.loggedUser);
    const userId = user?.id || user?._id;
    const page = Number(params.get('page')) || 1;
    const status = params.get('status') || '';
    const isRead = item => item.recipientRole === 'admin' ? item.readBy?.includes(userId) : item.isRead;

    const load = async () => {
        setLoading(true);
        setError('');
        try { const response = await getNotifications(page, 15, status); setData(response?.data?.data || { result: [], totalPage: 0, unreadCount: 0 }); }
        catch (requestError) { console.error('Notification page load failed:', requestError); setError('Không thể tải thông báo. Hãy kiểm tra BFF và Chat Service rồi thử lại.'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, [page, status]); // eslint-disable-line react-hooks/exhaustive-deps

    const select = item => {
        navigate(item.actionUrl || '/admin');
        if (!isRead(item)) {
            markNotificationRead(item.id || item._id)
                .then(() => window.dispatchEvent(new Event('notifications:refresh')))
                .catch(requestError => console.error('Mark notification read failed:', requestError));
        }
    };
    const readAll = async () => {
        try {
            await markAllNotificationsRead();
            await load();
            window.dispatchEvent(new Event('notifications:refresh'));
        } catch (requestError) {
            setError('Không thể cập nhật thông báo lúc này.');
        }
    };
    const setFilter = value => { const next = new URLSearchParams(); if (value) next.set('status', value); next.set('page', '1'); setParams(next); };
    const setPage = value => { const next = new URLSearchParams(params); next.set('page', value); setParams(next); };

    return <div className="notifications-page">
        <div className="notifications-page-head"><div><span>TRUNG TÂM THÔNG BÁO</span><h1>Thông báo của bạn</h1><p>Theo dõi lịch tư vấn và các yêu cầu cần xử lý.</p></div>{data.unreadCount > 0 && <button onClick={readAll}><i className="bi bi-check2-all" /> Đánh dấu tất cả đã đọc</button>}</div>
        <div className="notifications-toolbar"><div><button className={!status ? 'active' : ''} onClick={() => setFilter('')}>Tất cả</button><button className={status === 'unread' ? 'active' : ''} onClick={() => setFilter('unread')}>Chưa đọc <span>{data.unreadCount}</span></button></div></div>
        <section className="notifications-card">
            {loading && <div className="notifications-state"><span className="spinner-border" />Đang tải thông báo...</div>}
            {!loading && error && <div className="notifications-state"><i className="bi bi-exclamation-triangle" /><h3>Không thể tải dữ liệu</h3><p>{error}</p><button type="button" onClick={load}>Thử lại</button></div>}
            {!loading && !error && data.result?.length === 0 && <div className="notifications-state"><i className="bi bi-bell-slash" /><h3>Không có thông báo</h3><p>Các thông báo mới sẽ xuất hiện tại đây.</p></div>}
            {!loading && !error && data.result?.map(item => <button key={item.id || item._id} className={`notifications-row ${!isRead(item) ? 'unread' : ''}`} onClick={() => select(item)}>
                <span className={`notifications-row-icon ${item.type}`}><i className={`bi ${item.type === 'booking_paid' ? 'bi-calendar2-check' : 'bi-calendar2-plus'}`} /></span>
                <span className="notifications-row-content"><span><strong>{item.title}</strong>{!isRead(item) && <i />}</span><p>{item.message}</p><small><i className="bi bi-clock" /> {new Date(item.createdAt).toLocaleString('vi-VN')}</small></span>
                <i className="bi bi-chevron-right notifications-row-arrow" />
            </button>)}
        </section>
        {data.totalPage > 1 && <div className="notifications-pagination"><button disabled={page <= 1} onClick={() => setPage(page - 1)}><i className="bi bi-chevron-left" /></button><span>Trang {page} / {data.totalPage}</span><button disabled={page >= data.totalPage} onClick={() => setPage(page + 1)}><i className="bi bi-chevron-right" /></button></div>}
    </div>;
}
