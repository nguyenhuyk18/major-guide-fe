import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getCheckoutStatus } from '../../services/payment.api';
import '../../assets/css/PaymentCallbackPage.css';

const CONTENT = {
    processing: { icon: 'bi-arrow-repeat', title: 'Đang xác nhận thanh toán', message: 'Stripe đã tiếp nhận giao dịch. Hệ thống đang chờ xác nhận an toàn từ webhook.' },
    paid: { icon: 'bi-check-circle-fill', title: 'Thanh toán thành công!', message: 'Lịch tư vấn đã được xác nhận và thông tin cuộc họp sẽ xuất hiện trong lịch của bạn.' },
    failed: { icon: 'bi-x-circle-fill', title: 'Thanh toán chưa thành công', message: 'Giao dịch thất bại hoặc đã bị huỷ. Bạn có thể thử lại nếu lịch vẫn còn hiệu lực.' },
    expired: { icon: 'bi-clock-history', title: 'Phiên thanh toán đã hết hạn', message: 'Thời gian giữ lịch đã kết thúc. Vui lòng chọn lại một lịch tư vấn khác.' },
    error: { icon: 'bi-exclamation-triangle-fill', title: 'Không thể kiểm tra thanh toán', message: 'Vui lòng mở trang lịch đã đặt để kiểm tra trạng thái mới nhất.' },
};

export default function PaymentCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get('session_id');
    const [status, setStatus] = useState('processing');
    const [orderId, setOrderId] = useState('');
    const [checking, setChecking] = useState(false);
    const [retryKey, setRetryKey] = useState(0);

    useEffect(() => {
        let active = true;
        let timer;
        let attempts = 0;

        const check = async () => {
            if (!sessionId) { if (active) setStatus('error'); return; }
            if (active) setChecking(true);
            try {
                const response = await getCheckoutStatus(sessionId);
                const next = response?.data?.data?.status || 'processing';
                if (!active) return;
                setStatus(next);
                setOrderId(response?.data?.data?.orderId || '');
                attempts += 1;
                if (next === 'processing' && attempts < 40) timer = setTimeout(check, 2000);
            } catch (error) {
                console.error('Stripe status error:', error);
                attempts += 1;
                if (active && attempts < 5) timer = setTimeout(check, 2500);
                else if (active) setStatus('error');
            } finally {
                if (active) setChecking(false);
            }
        };
        check();
        return () => { active = false; clearTimeout(timer); };
    }, [sessionId, retryKey]);

    const view = CONTENT[status] || CONTENT.error;
    const isPaid = status === 'paid';
    return (
        <div className="payment-callback-page">
            <div className="payment-callback-orb payment-callback-orb-one" />
            <div className="payment-callback-orb payment-callback-orb-two" />
            <main className="payment-callback-shell">
                <section className={`payment-callback-card ${status}`}>
                    <div className="callback-card-accent" />
                    <div className="callback-content">
                        <div className={`callback-icon ${status}`}>
                            <span>{status === 'processing' ? <div className="spinner-border" role="status" /> : <i className={`bi ${view.icon}`} />}</span>
                        </div>
                        <span className="payment-provider"><i className="bi bi-shield-check" /> Thanh toán bảo mật bởi Stripe</span>
                        <h2>{view.title}</h2>
                        <p className="callback-message">{view.message}</p>

                        {isPaid && (
                            <div className="callback-timeline">
                                <div className="complete"><span><i className="bi bi-check-lg" /></span><small>Thanh toán</small></div>
                                <i />
                                <div className="complete"><span><i className="bi bi-check-lg" /></span><small>Xác nhận lịch</small></div>
                                <i />
                                <div><span><i className="bi bi-envelope-check" /></span><small>Nhận thông tin</small></div>
                            </div>
                        )}

                        <div className="callback-summary">
                            <div><span><i className="bi bi-receipt" /> Mã đặt lịch</span><strong>{orderId ? `#${orderId.slice(0, 8).toUpperCase()}` : 'Đang cập nhật'}</strong></div>
                            <div><span><i className="bi bi-shield-lock" /> Trạng thái</span><strong className={`callback-status ${status}`}>{isPaid ? 'Đã xác nhận' : status === 'processing' ? 'Đang xử lý' : 'Cần kiểm tra'}</strong></div>
                        </div>

                        {isPaid && <p className="callback-note"><i className="bi bi-info-circle" /> Bạn có thể xem đường dẫn cuộc họp trong mục lịch đã đặt.</p>}
                        <div className="callback-actions">
                            {(status === 'error' || status === 'processing') && <button className="callback-primary-action" disabled={checking} onClick={() => { setStatus('processing'); setRetryKey(key => key + 1); }}><i className={`bi bi-arrow-clockwise ${checking ? 'is-spinning' : ''}`} /> {checking ? 'Đang kiểm tra Stripe...' : 'Kiểm tra lại thanh toán'}</button>}
                            <button className="callback-primary-action" onClick={() => navigate('/my-bookings')}><i className="bi bi-calendar2-check" /> Xem lịch đã đặt <i className="bi bi-arrow-right" /></button>
                            <button className="callback-secondary-action" onClick={() => navigate('/')}><i className="bi bi-house-door" /> Về trang chủ</button>
                        </div>
                    </div>
                </section>
                <p className="callback-support"><i className="bi bi-headset" /> Cần hỗ trợ? <button type="button" onClick={() => navigate('/contact')}>Liên hệ MajorGuide</button></p>
            </main>
        </div>
    );
}
