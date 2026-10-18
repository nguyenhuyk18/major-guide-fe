import React, { useCallback, useEffect, useMemo, useState } from 'react';
import '../../assets/css/ExpertBookingAdmin.css';
import { getExpertBookings, expertJoinBooking } from '../../services/expert-booking.api';
import { getUserById } from '../../services/expert.api';
import { toast } from 'react-toastify';
import { useNavigate, useSearchParams } from 'react-router-dom';

const PAGE_SIZE = 10;
const STATUS = {
    reserved: { label: 'Chờ thanh toán', icon: 'bi-hourglass-split', tone: 'waiting' },
    paied: { label: 'Đã thanh toán', icon: 'bi-shield-check', tone: 'paid' },
    paid: { label: 'Đã thanh toán', icon: 'bi-shield-check', tone: 'paid' },
    complete: { label: 'Hoàn thành', icon: 'bi-check2-all', tone: 'complete' },
    cancle: { label: 'Đã hủy', icon: 'bi-x-circle', tone: 'cancelled' },
    cancelled: { label: 'Đã hủy', icon: 'bi-x-circle', tone: 'cancelled' },
    failed: { label: 'Thất bại', icon: 'bi-exclamation-circle', tone: 'failed' }
};

const parseDay = value => {
    if (!value) return null;
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [year, month, day] = value.split('-').map(Number);
        return new Date(year, month - 1, day);
    }
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const formatDate = value => {
    const date = parseDay(value);
    return date ? date.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' }) : '—';
};

const formatDateTime = value => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatTime = value => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '—' : date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatPrice = value => `${new Intl.NumberFormat('vi-VN').format(Number(value) || 0)} đ`;
const initials = name => (name || 'Học viên').trim().split(/\s+/).slice(-2).map(item => item[0]).join('').toUpperCase();
const bookingCode = booking => booking?.id_reverse || booking?._id || '—';

function StatusBadge({ status }) {
    const config = STATUS[status] || { label: status || 'Không rõ', icon: 'bi-question-circle', tone: 'unknown' };
    return <span className={`eb-status eb-status--${config.tone}`}><i className={`bi ${config.icon}`} />{config.label}</span>;
}

function DetailItem({ icon, label, value, mono, accent }) {
    return <div className="eb-detail-item"><span className="eb-detail-icon"><i className={`bi ${icon}`} /></span><div><small>{label}</small><strong className={`${mono ? 'is-mono' : ''} ${accent ? 'is-accent' : ''}`}>{value || '—'}</strong></div></div>;
}

export default function ExpertBookingManagePage() {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const targetBookingId = searchParams.get('bookingId');
    const [bookings, setBookings] = useState([]);
    const [totalPage, setTotalPage] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedBooking, setSelectedBooking] = useState(null);
    const [memberInfo, setMemberInfo] = useState(null);
    const [loadingMember, setLoadingMember] = useState(false);
    const [joining, setJoining] = useState(false);

    const loadMember = useCallback(async booking => {
        setLoadingMember(true);
        setMemberInfo(null);
        try {
            const response = await getUserById(booking.id_member);
            setMemberInfo(response?.data?.data || null);
        } catch (requestError) {
            console.error('Cannot load member:', requestError);
        } finally {
            setLoadingMember(false);
        }
    }, []);

    const openDetail = useCallback(booking => {
        setSelectedBooking(booking);
        loadMember(booking);
    }, [loadMember]);

    const fetchBookings = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await getExpertBookings(page, PAGE_SIZE);
            const payload = response?.data?.data || response?.data || {};
            const result = Array.isArray(payload.result) ? payload.result : [];
            const enrichedResult = await Promise.all(result.map(async booking => {
                if (!booking.id_member) return booking;
                try {
                    const memberResponse = await getUserById(booking.id_member);
                    return { ...booking, _member: memberResponse?.data?.data || null };
                } catch (memberError) {
                    console.warn(`Cannot load member ${booking.id_member}:`, memberError);
                    return booking;
                }
            }));
            setBookings(enrichedResult);
            setTotalPage(Number(payload.totalPage) || 0);
            const target = targetBookingId && enrichedResult.find(item => bookingCode(item) === targetBookingId);
            if (target) openDetail(target);
        } catch (requestError) {
            console.error('Cannot load expert bookings:', requestError);
            setError('Không thể tải lịch đặt. Hãy kiểm tra Booking Service rồi thử lại.');
        } finally {
            setLoading(false);
        }
    }, [openDetail, page, targetBookingId]);

    useEffect(() => { fetchBookings(); }, [fetchBookings]);

    useEffect(() => {
        if (!selectedBooking) return undefined;
        const close = event => event.key === 'Escape' && setSelectedBooking(null);
        window.addEventListener('keydown', close);
        document.body.classList.add('eb-modal-open');
        return () => { window.removeEventListener('keydown', close); document.body.classList.remove('eb-modal-open'); };
    }, [selectedBooking]);

    const visibleBookings = useMemo(() => {
        const keyword = search.trim().toLowerCase();
        return bookings.filter(item => {
            const matchesStatus = statusFilter === 'all' || item.status === statusFilter || (statusFilter === 'paied' && item.status === 'paid');
            const searchable = [bookingCode(item), item._member?.name, item._member?.username, item._member?.email, item.name_customer, item.email_customer, item.id_member, item.note].filter(Boolean).join(' ').toLowerCase();
            return matchesStatus && (!keyword || searchable.includes(keyword));
        });
    }, [bookings, search, statusFilter]);

    const stats = useMemo(() => ({
        total: bookings.length,
        paid: bookings.filter(item => ['paied', 'paid'].includes(item.status)).length,
        waiting: bookings.filter(item => item.status === 'reserved').length,
        completed: bookings.filter(item => item.status === 'complete').length
    }), [bookings]);

    const todayRelation = booking => {
        if (booking?.is_demo) return 'today'; // demo booking: call room always open
        const date = parseDay(booking?.day_support);
        if (!date) return 'unknown';
        const today = new Date();
        date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);
        return date.getTime() === today.getTime() ? 'today' : date < today ? 'past' : 'future';
    };

    const changePage = nextPage => {
        const next = new URLSearchParams(searchParams);
        next.set('page', String(nextPage));
        next.delete('bookingId');
        setSearchParams(next);
    };

    const joinCall = async () => {
        if (!selectedBooking || joining) return;
        setJoining(true);
        try {
            const id = bookingCode(selectedBooking);
            await expertJoinBooking(id);
            navigate(`/admin/video-call/${id}`);
        } catch (requestError) {
            console.error('Cannot join video call:', requestError);
            toast.error(requestError?.response?.data?.message || 'Không thể tham gia cuộc gọi lúc này.');
        } finally {
            setJoining(false);
        }
    };

    const closeModal = () => {
        setSelectedBooking(null);
        setMemberInfo(null);
        if (targetBookingId) {
            const next = new URLSearchParams(searchParams);
            next.delete('bookingId');
            setSearchParams(next, { replace: true });
        }
    };

    const selectedIsPaid = ['paied', 'paid', 'complete'].includes(selectedBooking?.status);
    const selectedRelation = todayRelation(selectedBooking);

    return <main className="expert-booking-management">
        <header className="eb-hero">
            <div className="eb-hero-copy"><span className="eb-eyebrow"><i className="bi bi-stars" /> Không gian tư vấn</span><h1>Lịch đặt của bạn</h1><p>Theo dõi học viên, lịch tư vấn và trạng thái thanh toán tại một nơi.</p></div>
            <button className="eb-refresh" type="button" onClick={fetchBookings} disabled={loading}><i className={`bi bi-arrow-clockwise ${loading ? 'is-spinning' : ''}`} /> Làm mới</button>
        </header>

        <section className="eb-stats" aria-label="Tổng quan lịch đặt">
            <div className="eb-stat"><span className="eb-stat-icon blue"><i className="bi bi-calendar2-week" /></span><div><strong>{stats.total}</strong><small>Trong trang này</small></div></div>
            <div className="eb-stat"><span className="eb-stat-icon green"><i className="bi bi-credit-card-2-front" /></span><div><strong>{stats.paid}</strong><small>Đã thanh toán</small></div></div>
            <div className="eb-stat"><span className="eb-stat-icon amber"><i className="bi bi-hourglass-split" /></span><div><strong>{stats.waiting}</strong><small>Chờ thanh toán</small></div></div>
            <div className="eb-stat"><span className="eb-stat-icon violet"><i className="bi bi-check2-all" /></span><div><strong>{stats.completed}</strong><small>Đã hoàn thành</small></div></div>
        </section>

        <section className="eb-panel">
            <div className="eb-toolbar">
                <div className="eb-search"><i className="bi bi-search" /><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm theo học viên, email hoặc mã lịch..." />{search && <button onClick={() => setSearch('')} aria-label="Xóa tìm kiếm"><i className="bi bi-x" /></button>}</div>
                <div className="eb-filters">
                    {[['all', 'Tất cả'], ['paied', 'Đã trả'], ['reserved', 'Chờ trả'], ['complete', 'Hoàn thành'], ['cancle', 'Đã hủy']].map(([value, label]) => <button key={value} className={statusFilter === value ? 'active' : ''} onClick={() => setStatusFilter(value)}>{label}</button>)}
                </div>
            </div>

            {loading ? <div className="eb-state"><span className="eb-loader" /><h3>Đang tải lịch đặt</h3><p>Vui lòng chờ trong giây lát...</p></div> : error ? <div className="eb-state eb-state--error"><i className="bi bi-cloud-slash" /><h3>Chưa thể tải dữ liệu</h3><p>{error}</p><button onClick={fetchBookings}>Thử lại</button></div> : visibleBookings.length === 0 ? <div className="eb-state"><i className="bi bi-calendar2-x" /><h3>Không tìm thấy lịch phù hợp</h3><p>Thử thay đổi từ khóa hoặc bộ lọc trạng thái.</p></div> : <>
                <div className="eb-table-scroll"><table className="eb-table">
                    <thead><tr><th>Học viên</th><th>Lịch tư vấn</th><th>Phí tư vấn</th><th>Trạng thái</th><th>Mã lịch</th><th aria-label="Thao tác" /></tr></thead>
                    <tbody>{visibleBookings.map(booking => <tr key={bookingCode(booking)} onClick={() => openDetail(booking)}>
                        <td><div className="eb-person">{booking._member?.fileAvartarUrl ? <img className="eb-avatar eb-avatar--image" src={booking._member.fileAvartarUrl} alt={booking._member.name || 'Học viên'} /> : <span className="eb-avatar">{initials(booking._member?.name || booking.name_customer)}</span>}<div><strong>{booking._member?.name || booking.name_customer || booking._member?.username || 'Học viên chưa cập nhật tên'}</strong><small>{booking._member?.email || booking.email_customer || booking.id_member || 'Chưa có email'}</small></div></div></td>
                        <td><div className="eb-schedule"><strong>{formatDate(booking.day_support)}{booking.is_demo && <span className="eb-demo-badge" title="Lịch demo: phòng gọi luôn mở">DEMO</span>}</strong><small><i className="bi bi-clock" /> {formatTime(booking.time_start)} – {formatTime(booking.time_end)}</small></div></td>
                        <td><span className="eb-price">{formatPrice(booking.price_support)}</span></td>
                        <td><StatusBadge status={booking.status} /></td>
                        <td><code className="eb-code">#{bookingCode(booking).slice(-8).toUpperCase()}</code></td>
                        <td><button className="eb-view" onClick={event => { event.stopPropagation(); openDetail(booking); }}><i className="bi bi-arrow-up-right" /></button></td>
                    </tr>)}</tbody>
                </table></div>
                <div className="eb-pagination"><span>Trang <strong>{page}</strong> trên <strong>{Math.max(totalPage, 1)}</strong></span><div><button disabled={page <= 1} onClick={() => changePage(page - 1)}><i className="bi bi-chevron-left" /> Trước</button><button disabled={page >= totalPage} onClick={() => changePage(page + 1)}>Sau <i className="bi bi-chevron-right" /></button></div></div>
            </>}
        </section>

        {selectedBooking && <div className="eb-overlay" onMouseDown={event => event.target === event.currentTarget && closeModal()}>
            <article className="eb-modal" role="dialog" aria-modal="true" aria-labelledby="eb-modal-title">
                <header className="eb-modal-header"><div><span>CHI TIẾT LỊCH TƯ VẤN</span><h2 id="eb-modal-title">#{bookingCode(selectedBooking).slice(-8).toUpperCase()}</h2></div><button onClick={closeModal} aria-label="Đóng"><i className="bi bi-x-lg" /></button></header>
                <div className="eb-modal-body">
                    <section className="eb-member-card">
                        {loadingMember ? <span className="eb-member-skeleton" /> : memberInfo?.fileAvartarUrl ? <img src={memberInfo.fileAvartarUrl} alt={memberInfo.name || 'Học viên'} /> : <span className="eb-member-avatar">{initials(memberInfo?.name || selectedBooking.name_customer)}</span>}
                        <div><small>HỌC VIÊN</small><h3>{memberInfo?.name || selectedBooking.name_customer || 'Học viên'}</h3><p><i className="bi bi-envelope" /> {memberInfo?.email || selectedBooking.email_customer || 'Chưa cập nhật email'}</p></div>
                        <StatusBadge status={selectedBooking.status} />
                    </section>

                    <div className="eb-modal-grid">
                        <section className="eb-detail-card"><h3><i className="bi bi-calendar3" /> Lịch tư vấn</h3><div className="eb-detail-grid">
                            <DetailItem icon="bi-calendar-event" label="Ngày hỗ trợ" value={formatDate(selectedBooking.day_support)} />
                            <DetailItem icon="bi-clock" label="Khung giờ" value={`${formatTime(selectedBooking.time_start)} – ${formatTime(selectedBooking.time_end)}`} />
                            <DetailItem icon="bi-cash-stack" label="Phí tư vấn" value={formatPrice(selectedBooking.price_support)} accent />
                            <DetailItem icon="bi-person-badge" label="Chuyên gia" value={selectedBooking.name_expert || 'Bạn'} />
                        </div>{selectedBooking.note && <div className="eb-note"><span><i className="bi bi-chat-left-text" /> Ghi chú từ học viên</span><p>{selectedBooking.note}</p></div>}</section>

                        <section className="eb-detail-card"><h3><i className="bi bi-receipt" /> Thanh toán & hệ thống</h3><div className="eb-detail-list">
                            <div><span>Mã lịch</span><code>{bookingCode(selectedBooking)}</code></div>
                            <div><span>ID học viên</span><code>{selectedBooking.id_member || memberInfo?._id || '—'}</code></div>
                            <div><span>Thanh toán lúc</span><strong>{formatDateTime(selectedBooking.payment_date)}</strong></div>
                            {selectedBooking.payment_expires_at && <div><span>Hạn thanh toán</span><strong>{formatDateTime(selectedBooking.payment_expires_at)}</strong></div>}
                            {(selectedBooking.stripe_payment_intent_id || selectedBooking.transaction_id) && <div><span>Mã giao dịch</span><code>{selectedBooking.stripe_payment_intent_id || selectedBooking.transaction_id}</code></div>}
                            {selectedBooking.joinAt && <div><span>Đã tham gia lúc</span><strong>{formatDateTime(selectedBooking.joinAt)}</strong></div>}
                        </div></section>
                    </div>
                </div>
                <footer className="eb-modal-footer"><div className={`eb-call-note eb-call-note--${selectedRelation}`}><i className={`bi ${selectedRelation === 'today' ? 'bi-camera-video' : selectedRelation === 'past' ? 'bi-clock-history' : 'bi-calendar-event'}`} /><span>{selectedRelation === 'today' ? (selectedIsPaid ? 'Phòng gọi đang mở trong hôm nay' : 'Lịch chưa được thanh toán') : selectedRelation === 'past' ? 'Lịch tư vấn này đã qua' : 'Phòng gọi sẽ mở đúng ngày tư vấn'}</span></div><div><button className="eb-btn eb-btn--ghost" onClick={closeModal}>Đóng</button>{selectedIsPaid && selectedRelation === 'today' && <button className="eb-btn eb-btn--primary" onClick={joinCall} disabled={joining}><i className={`bi ${joining ? 'bi-arrow-repeat is-spinning' : 'bi-camera-video-fill'}`} /> {joining ? 'Đang kết nối...' : 'Vào phòng gọi'}</button>}</div></footer>
            </article>
        </div>}
    </main>;
}
