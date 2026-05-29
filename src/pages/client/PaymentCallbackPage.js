import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { confirmPayment } from '../../services/payment.api';
import '../../assets/css/PaymentCallbackPage.css';

export default function PaymentCallbackPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('');

    useEffect(() => {
        handleVNPayCallback();
    }, []);

    const handleVNPayCallback = async () => {
        try {
            const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');
            const vnp_TxnRef = searchParams.get('vnp_TxnRef');
            const vnp_TransactionStatus = searchParams.get('vnp_TransactionStatus');
            console.log(vnp_ResponseCode , ' ' , vnp_TxnRef , ' ' , vnp_TransactionStatus)
            const isValid = vnp_ResponseCode === '00' && vnp_TransactionStatus === '00';

            const responseCode = vnp_ResponseCode || vnp_TransactionStatus || '';

            await confirmPayment(isValid, vnp_TxnRef, responseCode);

            if (isValid) {
                setStatus('success');
                setMessage('Thanh toán thành công!');
                toast.success('Thanh toán thành công!');
                navigate('/');
            } else {
                setStatus('failed');
                setMessage('Thanh toán thất bại. Vui lòng thử lại hoặc liên hệ hỗ trợ.');
                toast.error('Thanh toán thất bại!');
                navigate('/');
            }
        } catch (error) {
            console.error('Payment callback error:', error);
            setStatus('error');
            setMessage('Đã xảy ra lỗi khi xử lý thanh toán. Vui lòng liên hệ hỗ trợ.');
            toast.error('Xử lý thanh toán thất bại!');
            navigate('/');
        }
    };

    const handleGoToMyBookings = () => {
        navigate('/my-bookings');
    };

    const handleGoHome = () => {
        navigate('/');
    };

    return (
        <div className="payment-callback-page">
            <div className="container py-5">
                <div className="payment-callback-card">
                    {status === 'processing' && (
                        <div className="callback-content processing">
                            <div className="callback-icon processing">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                            <h2>Đang xử lý thanh toán...</h2>
                            <p>Vui lòng chờ trong giây lát</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="callback-content success">
                            <div className="callback-icon success">
                                <i className="bi bi-check-circle-fill"></i>
                            </div>
                            <h2>Thanh toán thành công!</h2>
                            <p>Cảm ơn bạn đã đặt lịch tư vấn. Chúng tôi sẽ liên hệ với bạn sớm nhất.</p>
                            <div className="callback-actions">
                                <button className="btn btn-primary" onClick={handleGoToMyBookings}>
                                    <i className="bi bi-calendar-check"></i>
                                    Xem lịch đã đặt
                                </button>
                                <button className="btn btn-outline-primary" onClick={handleGoHome}>
                                    <i className="bi bi-house"></i>
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="callback-content failed">
                            <div className="callback-icon failed">
                                <i className="bi bi-x-circle-fill"></i>
                            </div>
                            <h2>Thanh toán thất bại</h2>
                            <p>{message}</p>
                            <div className="callback-actions">
                                <button className="btn btn-warning" onClick={handleGoToMyBookings}>
                                    <i className="bi bi-arrow-repeat"></i>
                                    Thử thanh toán lại
                                </button>
                                <button className="btn btn-outline-secondary" onClick={handleGoHome}>
                                    <i className="bi bi-house"></i>
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="callback-content error">
                            <div className="callback-icon error">
                                <i className="bi bi-exclamation-triangle-fill"></i>
                            </div>
                            <h2>Đã xảy ra lỗi</h2>
                            <p>{message}</p>
                            <div className="callback-actions">
                                <button className="btn btn-primary" onClick={handleGoToMyBookings}>
                                    <i className="bi bi-calendar-check"></i>
                                    Xem lịch đặt
                                </button>
                                <button className="btn btn-outline-secondary" onClick={handleGoHome}>
                                    <i className="bi bi-house"></i>
                                    Về trang chủ
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
