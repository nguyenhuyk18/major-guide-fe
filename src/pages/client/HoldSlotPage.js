import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import '../../assets/css/HoldSLotPage.css';
import { getUserAccess } from '../../services/user-access.api';
import { findShiftById } from '../../services/slot.api';
import { holdSlotBooking } from '../../services/booking.api';
import { useSelector } from 'react-redux';

const DAY_VI = {
    monday: 'Thứ Hai',
    tuesday: 'Thứ Ba',
    wednesday: 'Thứ Tư',
    thursday: 'Thứ Năm',
    friday: 'Thứ Sáu',
    saturday: 'Thứ Bảy',
    sunday: 'Chủ Nhật',
};

const LEVEL_VI = {
    professor: 'Giáo sư',
    associate_professor: 'Phó Giáo sư',
    doctor: 'Tiến sĩ',
    master: 'Thạc sĩ',
    bachelor: 'Cử nhân',
};

const PLATFORM_FEE = 45000;

export default function HoldSlotPage() {
    const userInfo = useSelector(state => state.authClientReducer.loggedUser);
    const isLogin = useSelector(state => state.authClientReducer.isLogin);

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const slotId = searchParams.get('slot_id') || '';
    const expertId = searchParams.get('expert_id') || '';
    const specifyTime = searchParams.get('specify_time') || '';

    const [expertInfo, setExpertInfo] = useState(null);
    const [slotInfo, setSlotInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [confirming, setConfirming] = useState(false);
    const [note, setNote] = useState('');

    useEffect(() => {
        if (!isLogin) {
            toast.error('Vui lòng đăng nhập để đặt lịch!');
            navigate('/');
            return;
        }
        const fetchData = async () => {
            try {
                const [expertRes, slotRes] = await Promise.all([
                    getUserAccess(expertId),
                    findShiftById(slotId),
                ]);
                setExpertInfo(expertRes?.data?.data);
                setSlotInfo(slotRes?.data?.data);
            } catch (err) {
                console.error('Error fetching checkout data:', err);
            } finally {
                setLoading(false);
            }
        };

        if (expertId && slotId) {
            fetchData();
        } else {
            setLoading(false);
        }
    }, [expertId, slotId, isLogin, navigate]);

    const getSupportDate = () => {
        if (specifyTime) {
            const [y, m, d] = specifyTime.split('-').map(Number);
            const date = new Date(y, m - 1, d);
            date.setHours(0, 0, 0, 0);
            return date;
        }
        const dayOrder = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const targetIndex = dayOrder.indexOf(slotInfo?.day?.toLowerCase());
        if (targetIndex === -1) return today;
        const diff = targetIndex - today.getDay();
        const result = new Date(today);
        result.setDate(today.getDate() + diff);
        return result;
    };

    const buildDateTime = (dateObj, timeStr) => {
        const [hours, minutes] = (timeStr || '0:0').split(':').map(Number);
        const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hours, minutes, 0, 0);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const m = String(d.getMinutes()).padStart(2, '0');
        const s = String(d.getSeconds()).padStart(2, '0');
        // Sử dụng local timezone thay vì UTC
        const offset = -d.getTimezoneOffset();
        const sign = offset >= 0 ? '+' : '-';
        const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
        const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
        return `${year}-${month}-${day}T${h}:${m}:${s}.000${sign}${offsetHours}:${offsetMinutes}`;
    };

    const handleConfirm = async () => {
        if (!expertInfo || !slotInfo) return;

        const dayDate = getSupportDate();
        console.log(dayDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const diffDays = Math.round((dayDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        if (diffDays < 1) {
            toast.error('Không thể đặt lịch trong ngày! Vui lòng chọn ngày từ ngày mai trở đi.');
            return;
        }
        if (diffDays > 7) {
            toast.error('Chỉ có thể đặt lịch trước tối đa 7 ngày!');
            return;
        }

        // Format dayDate thành string YYYY-MM-DD
        const formatDateToLocalString = (dateObj) => {
            const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };

        const payload = {
            id_expert: expertId,
            id_shift_in_day: slotId,
            day_support: formatDateToLocalString(dayDate),
            time_start: buildDateTime(dayDate, slotInfo.shift_id?.start_time),
            time_end: buildDateTime(dayDate, slotInfo.shift_id?.end_time),
            price_support: expertInfo.expertProfile?.price ?? 0,
            note: note.trim(),
            name_customer: userInfo?.name,
            name_expert: expertInfo?.name,
            avatar_expert: expertInfo.fileAvartarUrl
        };
        console.log(payload);   
        try {
            setConfirming(true);
            
            const bookingRes = await holdSlotBooking(payload);
            
            toast.success('Đặt lịch thành công! Vui lòng thanh toán để xác nhận.');
            navigate('/my-bookings');

        } catch (err) {
            const msg = err?.response?.data?.message || err.message || 'Đặt lịch thất bại, vui lòng thử lại!';
            toast.error(msg);
        } finally {
            setConfirming(false);
        }
    };

    if (loading) {
        return (
            <div className="hold-slot-page">
                <div className="container py-5 text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Đang tải...</span>
                    </div>
                    <p className="mt-3 text-muted">Đang tải thông tin đặt lịch…</p>
                </div>
            </div>
        );
    }

    const expertPrice = expertInfo?.expertProfile?.price ?? 0;
    const totalPrice = expertPrice + PLATFORM_FEE;
    const shiftDay = DAY_VI[slotInfo?.day] ?? slotInfo?.day ?? '—';
    const shiftName = slotInfo?.shift_id?.name_shift ?? '—';
    const shiftTime = slotInfo?.shift_id
        ? `${slotInfo.shift_id.start_time} – ${slotInfo.shift_id.end_time}`
        : '—';
    const expertLevel = LEVEL_VI[expertInfo?.expertProfile?.level] ?? expertInfo?.expertProfile?.level ?? '';

    return (
        <>
            <div className="hold-slot-page">
                <div className="container py-5">
                    <Link
                        href="#"
                        className="d-inline-flex align-items-center text-decoration-none text-secondary mb-4"
                        onClick={(e) => { e.preventDefault(); navigate(-1); }}
                    >
                        <i className="bi bi-chevron-left me-2"></i>
                        <span>Quay Lại</span>
                    </Link>

                    <div className="mb-5">
                        <h1 className="display-5 fw-bold mb-2">Xác Nhận Đặt Lịch</h1>
                        <p className="text-secondary fs-5">Kiểm tra và xác nhận buổi học với cố vấn của bạn.</p>
                    </div>

                    <div className="row g-4">
                        <div className="col-12 col-lg-7">
                            {expertInfo && (
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body p-4">
                                        <h5 className="card-title d-flex align-items-center mb-4">
                                            <i className="bi bi-person-badge text-primary me-2"></i>
                                            Thông tin Cố vấn
                                        </h5>
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="position-relative flex-shrink-0">
                                                <img
                                                    src={expertInfo.fileAvartarUrl}
                                                    alt={expertInfo.name}
                                                    className="rounded-circle object-fit-cover border"
                                                    width="80"
                                                    height="80"
                                                />
                                                <span
                                                    className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle"
                                                    style={{ width: '14px', height: '14px' }}
                                                ></span>
                                            </div>
                                            <div>
                                                <div className="badge bg-primary-subtle text-primary mb-2">
                                                    {expertLevel}
                                                </div>
                                                <h5 className="fw-bold mb-1">{expertInfo.name}</h5>
                                                <p className="text-primary fw-semibold small mb-1">
                                                    {expertInfo.expertProfile?.major}
                                                </p>
                                                <p className="text-secondary small mb-0">
                                                    <i className="bi bi-building me-1"></i>
                                                    {expertInfo.expertProfile?.teachAt}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {slotInfo && (
                                <div className="card border-0 shadow-sm mb-4">
                                    <div className="card-body p-4">
                                        <h5 className="card-title d-flex align-items-center mb-4">
                                            <i className="bi bi-calendar-check text-primary me-2"></i>
                                            Thông tin Ca học
                                        </h5>
                                        <div className="row g-3">
                                            <div className="col-6">
                                                <div className="p-3 bg-light rounded-3">
                                                    <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Thứ trong tuần</small>
                                                    <span className="fw-semibold">{shiftDay}</span>
                                                </div>
                                            </div>
                                            <div className="col-6">
                                                <div className="p-3 bg-light rounded-3">
                                                    <small className="text-muted text-uppercase fw-bold d-block mb-1" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Tên ca</small>
                                                    <span className="fw-semibold">{shiftName}</span>
                                                </div>
                                            </div>
                                            <div className="col-12">
                                                <div className="p-3 bg-primary bg-opacity-10 rounded-3 d-flex align-items-center gap-2">
                                                    <i className="bi bi-clock-fill text-primary fs-5"></i>
                                                    <div>
                                                        <small className="text-muted text-uppercase fw-bold d-block" style={{ fontSize: '10px', letterSpacing: '0.5px' }}>Khung giờ</small>
                                                        <span className="fw-bold fs-5 text-primary">{shiftTime}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h5 className="card-title d-flex align-items-center mb-3">
                                        <i className="bi bi-journal-text text-primary me-2"></i>
                                        Ghi chú cho Cố vấn
                                    </h5>
                                    <p className="text-secondary small mb-3">
                                        Mô tả ngắn gọn mục tiêu của bạn hoặc câu hỏi cụ thể
                                        {expertInfo ? ` cho ${expertInfo.name}.` : '.'}
                                    </p>
                                    <textarea
                                        className="form-control note-to-mentor"
                                        rows="5"
                                        placeholder="Nhập ghi chú..."
                                        value={note}
                                        onChange={(e) => setNote(e.target.value)}
                                    ></textarea>
                                </div>
                            </div>
                        </div>

                        <div className="col-12 col-lg-5">
                            <div className="card border-0 shadow-sm">
                                <div className="card-body p-4">
                                    <h5 className="card-title fw-bold mb-4">Tóm tắt Đặt lịch</h5>

                                    {expertInfo && (
                                        <div className="d-flex align-items-center mb-4 pb-3 border-bottom">
                                            <img
                                                src={expertInfo.fileAvartarUrl}
                                                alt={expertInfo.name}
                                                className="rounded-circle object-fit-cover me-3 flex-shrink-0"
                                                width="48"
                                                height="48"
                                            />
                                            <div className="flex-grow-1 overflow-hidden">
                                                <div className="fw-bold text-truncate">{expertInfo.name}</div>
                                                <div className="text-muted small text-truncate">{expertInfo.expertProfile?.major}</div>
                                            </div>
                                            <span className="badge bg-primary-subtle text-primary ms-2 flex-shrink-0">
                                                {expertLevel}
                                            </span>
                                        </div>
                                    )}

                                    <div className="mb-3">
                                        <div className="d-flex align-items-center mb-1">
                                            <i className="bi bi-calendar3 text-primary me-2"></i>
                                            <small className="text-secondary text-uppercase fw-semibold">Ngày học</small>
                                        </div>
                                        <div className="fw-semibold ps-4">{shiftDay}</div>
                                    </div>

                                    <div className="mb-4 pb-4 border-bottom">
                                        <div className="d-flex align-items-center mb-1">
                                            <i className="bi bi-clock text-primary me-2"></i>
                                            <small className="text-secondary text-uppercase fw-semibold">Khung giờ</small>
                                        </div>
                                        <div className="fw-semibold ps-4">
                                            {shiftName} &nbsp;·&nbsp; {shiftTime}
                                        </div>
                                    </div>

                                    <div className="mb-4">
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-secondary">Phí cố vấn</span>
                                            <span className="fw-semibold">{expertPrice.toLocaleString('vi-VN')} VNĐ</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-2">
                                            <span className="text-secondary">Phí dịch vụ nền tảng</span>
                                            <span className="fw-semibold">{PLATFORM_FEE.toLocaleString('vi-VN')} VNĐ</span>
                                        </div>
                                    </div>

                                    <div className="border-top pt-3 mb-4">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <span className="text-primary text-uppercase small fw-bold">Tổng cộng</span>
                                            <h4 className="fw-bold mb-0 text-primary">
                                                {totalPrice.toLocaleString('vi-VN')} VNĐ
                                            </h4>
                                        </div>
                                    </div>

                                    <button
                                        className="btn btn-primary w-100 py-3 mb-3 fw-semibold"
                                        onClick={handleConfirm}
                                        disabled={confirming}
                                    >
                                        {confirming ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                Đang xử lý...
                                            </>
                                        ) : (
                                            <>
                                                Xác nhận đặt lịch
                                                <i className="bi bi-check-lg ms-2"></i>
                                            </>
                                        )}
                                    </button>

                                    <p className="text-center text-secondary small mb-0">
                                        Bằng cách nhấn xác nhận, bạn đồng ý với{' '}
                                        <Link href="#" className="text-decoration-none">Điều khoản Dịch vụ</Link>
                                        {' '}và{' '}
                                        <Link href="#" className="text-decoration-none">Chính sách Hủy lịch</Link>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
