import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../../assets/css/RegisterSchedulePage.css';
import { getAllShift, getShiftByExpertId, getShiftInDayOnly, checkShiftStatus } from '../../services/slot.api';
import { getCurrentWeek, getWeekNumber } from '../../helpers/help';
import { DAY_IN_WEEK } from '../../constants/constant';
import { getUserAccess } from '../../services/user-access.api';
import { useSelector } from 'react-redux';

const DAY_SHORT = { monday: 'MON', tuesday: 'TUE', wednesday: 'WED', thursday: 'THU', friday: 'FRI', saturday: 'SAT' };


export default function RegisterSchedulePage() {
    // const reducer = useReducer();
    const userInfo = useSelector(state => state.authClientReducer.loggedUser);
    const isLogin = useSelector(state => state.authClientReducer.isLogin);

    const navigate = useNavigate();

    const [searchParam, setSearchParam] = useSearchParams();

    const endTime = searchParam.get('end_time') || '';
    const startTime = searchParam.get('start_time') || '';
    const expertId = searchParam.get('expert_id') || '';

    // console.log(expertId);
    const [shiftList, setShiftList] = useState(null);          // Danh sách ca (shift types)
    const [allShiftInDay, setAllShiftInDay] = useState(null);   // Tất cả slot trong tuần
    const [expertRegistered, setExpertRegistered] = useState(null); // Slot expert đã đăng ký
    const [dayInWeek, setDayInWeek] = useState(null);
    const [arrayDayInWeek, setArrayDayInWeek] = useState([]);
    const [loading, setLoading] = useState(true);
    // thông tin chuyên gia
    const [expertInfo, setExpertInfo] = useState(null);
    // Map slotId -> { status, is_available } từ API check-status
    const [slotStatusMap, setSlotStatusMap] = useState({});
    const [statusLoading, setStatusLoading] = useState(false);
    // Track expert chưa có lịch
    const [expertHasNoSchedule, setExpertHasNoSchedule] = useState(false);
    const [fetchError, setFetchError] = useState(false);





    useEffect(() => {
        buildWeek(startTime);
        getUserExpert();
        fetchShiftList();

        if (!isLogin) {
            toast.error('Vui lòng đăng nhập để đặt lịch!');
            navigate('/experts')
        }

        if (userInfo?.role_name === 'admin' || userInfo?.role_name === 'expert') {
            toast.error('Bạn không có quyền đặt lịch!');
            navigate('/')
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [endTime, startTime, expertId]);


    const getUserExpert = async () => {
        const expertInfo = await getUserAccess(expertId);
        setExpertInfo(expertInfo.data.data);
    }

    /* ── Tính tuần hiện tại ── */
    const buildWeek = (startDate) => {
        const arr = getCurrentWeek(startDate || new Date());
        const numOfWeek = getWeekNumber(startDate || new Date());
        setArrayDayInWeek(arr);

        const endDay = new Date(arr[arr.length - 1]);
        endDay.setDate(endDay.getDate() - 1); // Bỏ CN ra

        setDayInWeek({
            startDay: arr[0],
            endDay,
            numOfWeek,
        });

        fetchScheduleData(endDay, arr[0], arr);
    };

    /* ── Lấy dữ liệu lịch ── */
    const fetchShiftList = async () => {
        try {
            const rs = await getAllShift();
            setShiftList(rs.data.data.data);
        } catch (error) {
            toast.error('Không thể tải danh sách ca học!');
        }
    };

    const fetchScheduleData = async (endDay, startDay, weekArr) => {
        setLoading(true);
        setSlotStatusMap({});
        setExpertHasNoSchedule(false);
        setFetchError(false);
        try {
            const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

            // Tất cả slot trong tuần
            const rs1 = await getShiftInDayOnly();
            const allSlots = rs1.data.data;
            setAllShiftInDay(allSlots);

            // Lịch expert đã đăng ký (nếu có expertId)
            let registeredSlots = [];
            if (expertId) {
                try {
                    const rs2 = await getShiftByExpertId(expertId, fmt(startDay), fmt(endDay));
                    registeredSlots = rs2?.data?.data?.day || [];
                    setExpertRegistered(registeredSlots);

                    // Kiểm tra expert có lịch chưa
                    if (!registeredSlots || registeredSlots.length === 0) {
                        setExpertHasNoSchedule(true);
                    }
                } catch (expertErr) {
                    // Expert chưa có lịch → không phải lỗi server
                    console.log('Expert chưa có lịch đăng ký:', expertErr?.response?.data?.message || expertErr.message);
                    setExpertRegistered([]);
                    setExpertHasNoSchedule(true);
                }
            } else {
                setExpertRegistered([]);
            }

            // Gọi check-status cho từng slot expert đã đăng ký
            if (expertId && registeredSlots.length > 0) {
                setStatusLoading(true);
                const statusMap = {};
                await Promise.all(
                    registeredSlots.map(async (reg) => {
                        const slotId = reg?.id || reg?._id;

                        // reg.day đã có sẵn từ response getShiftByExpertId (vd: 'monday')
                        const dayIndex = DAY_IN_WEEK.indexOf(reg?.day);
                        if (dayIndex === -1 || !weekArr?.[dayIndex]) return;
                        const dateStr = fmt(weekArr[dayIndex]);
                        try {
                            const rs = await checkShiftStatus(dateStr, slotId, expertId);
                            statusMap[slotId] = rs.data.data;
                        } catch (e) {
                            statusMap[slotId] = { status: 'unavailable', is_available: false };
                        }
                    })
                );
                // console.log('[DEBUG] statusMap keys:', Object.keys(statusMap), '| values:', statusMap);
                setSlotStatusMap(statusMap);
                setStatusLoading(false);
            }
        } catch (error) {
            console.log(error);
            setFetchError(true);
        } finally {
            setLoading(false);
        }
    };
    // console.log('[DEBUG] slotStatusMap state:', slotStatusMap);
    /* ── Điều hướng tuần ── */
    const goToWeek = (dateInTargetWeek) => {
        const tmp = getCurrentWeek(dateInTargetWeek);
        const oldUrl = new URLSearchParams(searchParam.toString());
        oldUrl.set('start_time', `${tmp[0].getFullYear()}-${tmp[0].getMonth() + 1}-${tmp[0].getDate()}`);
        oldUrl.set('end_time', `${tmp[tmp.length - 1].getFullYear()}-${tmp[tmp.length - 1].getMonth() + 1}-${tmp[tmp.length - 1].getDate()}`);
        setSearchParam(oldUrl);
    };

    // const handlePreviousWeek = () => {
    //     const d = new Date(dayInWeek.startDay);
    //     d.setDate(d.getDate() - 7);
    //     goToWeek(d);
    // };

    const handleCurrentWeek = () => goToWeek(new Date());

    const handleNextWeek = () => {
        const d = new Date(dayInWeek.startDay);
        d.setDate(d.getDate() + 7);
        goToWeek(d);
    };

    /* ── Kiểm tra slot có được expert đăng ký không ── */
    const isExpertAvailable = (shiftInDayId) => {
        if (!expertRegistered || expertRegistered.length === 0) return false;
        return expertRegistered.some(reg => reg?.id === shiftInDayId || reg?._id === shiftInDayId);
    };

    /* ── Render theo status từ API ── */
    const renderStatusContent = (slot, shift, dateStr) => {
        const slotId = slot.id || slot._id;
        const statusInfo = slotStatusMap[slotId];

        // Đang chờ load status
        if (statusLoading && isExpertAvailable(slotId) && !statusInfo) {
            return (
                <div className="cell-content">
                    <div className="d-flex justify-content-center py-1">
                        <div className="spinner-border spinner-border-sm text-secondary" role="status">
                            <span className="visually-hidden">...</span>
                        </div>
                    </div>
                </div>
            );
        }

        if (!statusInfo) {
            // Không có trong danh sách đăng ký → chưa mở
            return (
                <div className="cell-content">
                    <span className="shift-status-badge status-busy">
                        <i className="bi bi-lock-fill me-1"></i>Chưa mở
                    </span>
                </div>
            );
        }

        const { status } = statusInfo;
        console.log(status, '   ', dateStr);

        // Chỉ AVAILABLE mới hiển thị nút đặt lịch
        if (status === 'available') {
            return (
                <div className="cell-content">
                    <span className="shift-status-badge status-available">
                        <i className="bi bi-check-circle-fill me-1"></i>Có thể đặt
                    </span>
                    <Link
                        to={`/hold-slot?slot_id=${slotId}&expert_id=${expertId}&specify_time=${dateStr}`}
                        className="btn btn-primary btn-sm w-100 btn-chon mt-2"
                    >
                        Đặt lịch
                    </Link>
                </div>
            );
        }

        if (status === 'holding') {
            return (
                <div className="cell-content">
                    <span className="shift-status-badge status-holding">
                        <i className="bi bi-hourglass-split me-1"></i>Đang giữ chỗ
                    </span>
                </div>
            );
        }

        if (status === 'cancle') {
            return (
                <div className="cell-content">
                    <span className="shift-status-badge status-cancle">
                        <i className="bi bi-calendar2-x-fill me-1"></i>Chuyên gia bận
                    </span>
                </div>
            );
        }

        if (status === 'ordered') {
            return (
                <div className="cell-content">
                    <span className="shift-status-badge status-ordered">
                        <i className="bi bi-person-check-fill me-1"></i>Đã được đặt
                    </span>
                </div>
            );
        }

        // fallback
        return (
            <div className="cell-content">
                <span className="shift-status-badge status-busy">
                    <i className="bi bi-dash-circle me-1"></i>Không xác định
                </span>
            </div>
        );
    };

    /* ── Render cell ── */
    const renderCell = (shift, day, dayIndex) => {
        if (!allShiftInDay) return <td key={day}><div className="cell-time">—</div></td>;

        const slot = allShiftInDay.find(s => s.day === day && (s.shift_id?.id === shift.id || s.shift_id?._id === shift.id));

        if (!slot) {
            return (
                <td key={day}>
                    <div className="cell-time">{shift.start_time} - {shift.end_time}</div>
                    <div className="cell-content">
                        <span className="shift-status-badge status-busy">
                            <i className="bi bi-calendar-x me-1"></i>Bận
                        </span>
                    </div>
                </td>
            );
        }
        // console.log(slot.)
        const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const dateStr = arrayDayInWeek[dayIndex] ? fmt(arrayDayInWeek[dayIndex]) : '';

        return (
            <td key={day}>
                <div className="cell-time">{shift.start_time} - {shift.end_time}</div>
                {renderStatusContent(slot, shift, dateStr)}
            </td>
        );
    };

    const isDataReady = !loading && shiftList && allShiftInDay && expertRegistered;

    return (
        <>
            <div className="schedule-page-bg py-5">
                <div className="container">

                    {/* Header Card – Expert Info */}
                    <div className="card shadow-sm border-0 rounded-4 mb-5">
                        <div className="card-body d-flex align-items-center p-4">
                            {expertInfo && (
                                <>
                                    <div className="position-relative me-4">
                                        <img
                                            src={expertInfo.fileAvartarUrl}
                                            alt="Avatar"
                                            className="rounded-circle object-fit-cover"
                                            style={{ width: '80px', height: '80px' }}
                                        />
                                        <span className="position-absolute bottom-0 end-0 bg-success border border-2 border-white rounded-circle p-1" style={{ width: '16px', height: '16px' }}></span>
                                    </div>
                                    <div className="flex-grow-1">
                                        <h4 className="fw-bold mb-1">{expertInfo.name}</h4>
                                        <p className="fw-bold mb-2 text-primary" style={{ fontSize: '12px', letterSpacing: '0.5px' }}>
                                            {expertInfo.expertProfile.major}
                                        </p>
                                        {/* <div className="d-flex flex-wrap gap-2">
                                            <span className="badge rounded-pill custom-badge">PhD in AI</span>
                                            <span className="badge rounded-pill custom-badge">10+ Years Exp</span>
                                            <span className="badge rounded-pill custom-badge">Highly Rated</span>
                                        </div> */}
                                    </div>
                                </>
                            )}

                            <div className="text-end ps-4 border-start d-none d-md-block" style={{ minWidth: '200px' }}>
                                <h6 className="text-muted text-uppercase fw-bold mb-1" style={{ fontSize: '10px', letterSpacing: '1px' }}>Tuần hiển thị</h6>
                                <h5 className="fw-bold mb-0 fs-6">
                                    {dayInWeek
                                        ? `${dayInWeek.startDay.toLocaleDateString('vi-VN')} – ${dayInWeek.endDay.toLocaleDateString('vi-VN')}`
                                        : '—'}
                                </h5>
                            </div>
                        </div>
                    </div>

                    {/* Title & Week navigation */}
                    <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
                        <div>
                            <h3 className="fw-bold mb-0">Lịch Tư Vấn Hàng Tuần</h3>
                            {dayInWeek && (
                                <small className="text-muted">
                                    Tuần {dayInWeek.numOfWeek}: {dayInWeek.startDay.toLocaleDateString('vi-VN')} – {dayInWeek.endDay.toLocaleDateString('vi-VN')}
                                </small>
                            )}
                        </div>
                        <div className="border rounded-pill p-1 bg-white custom-toggle">
                            {/* <button className="btn btn-sm rounded-pill text-muted px-3 fw-bold" onClick={handlePreviousWeek}>
                                <i className="bi bi-chevron-left me-1"></i>Trước
                            </button> */}
                            <button className="btn btn-sm rounded-pill active-toggle px-3 fw-bold" onClick={handleCurrentWeek}>
                                Tuần này
                            </button>
                            <button className="btn btn-sm rounded-pill text-muted px-3 fw-bold" onClick={handleNextWeek}>
                                Sau<i className="bi bi-chevron-right ms-1"></i>
                            </button>
                        </div>
                    </div>

                    {/* Expert No Schedule Alert */}
                    {expertHasNoSchedule && !loading && (
                        <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
                            <i className="bi bi-exclamation-triangle-fill me-3 fs-4"></i>
                            <div>
                                <strong>Chuyên gia chưa có lịch chính thức.</strong>
                                <span className="d-block text-muted" style={{ fontSize: '14px' }}>Vui lòng chọn chuyên gia khác hoặc quay lại sau.</span>
                            </div>
                            <Link to="/experts" className="btn btn-warning btn-sm ms-auto">
                                <i className="bi bi-arrow-left me-1"></i>Quay lại
                            </Link>
                        </div>
                    )}

                    {/* Schedule Table */}
                    {loading ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Đang tải...</span>
                            </div>
                            <p className="mt-3 text-muted">Đang tải lịch tư vấn…</p>
                        </div>
                    ) : fetchError ? (
                        <div className="text-center py-5">
                            <div className="mb-3">
                                <i className="bi bi-exclamation-triangle-fill text-warning" style={{ fontSize: '3rem' }}></i>
                            </div>
                            <h5 className="text-muted mb-2">Server đang bận</h5>
                            <p className="text-muted">Vui lòng thử lại sau.</p>
                        </div>
                    ) : (
                        <div className="schedule-wrapper bg-white shadow-sm">
                            <table className="custom-schedule-table">
                                <thead>
                                    <tr>
                                        {DAY_IN_WEEK.map((day, i) => (
                                            <th key={day}>
                                                <div className="text-muted small fw-bold text-uppercase">{DAY_SHORT[day]}</div>
                                                <div className="fs-6 text-dark">
                                                    {arrayDayInWeek[i]
                                                        ? `${arrayDayInWeek[i].getDate()} ${arrayDayInWeek[i].toLocaleString('vi-VN', { month: 'short' }).toUpperCase()}`
                                                        : ''}
                                                </div>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {isDataReady && shiftList.map((shift, idx) => (
                                        <tr key={idx}>
                                            {DAY_IN_WEEK.map((day, dayIdx) => renderCell(shift, day, dayIdx))}
                                        </tr>
                                    ))}

                                    {isDataReady && shiftList.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center text-muted py-4">
                                                Không có ca nào trong tuần này.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="d-flex flex-wrap gap-3 px-4 py-3 border rounded-4 bg-white mt-4 align-items-center shadow-sm">
                        <span className="fw-semibold text-muted me-1" style={{ fontSize: '12px' }}>Chú thích:</span>
                        <span className="shift-status-badge status-available"><i className="bi bi-check-circle-fill me-1"></i>Có thể đặt</span>
                        <span className="shift-status-badge status-holding"><i className="bi bi-hourglass-split me-1"></i>Đang giữ chỗ</span>
                        <span className="shift-status-badge status-cancle"><i className="bi bi-calendar2-x-fill me-1"></i>Chuyên gia bận</span>
                        <span className="shift-status-badge status-ordered"><i className="bi bi-person-check-fill me-1"></i>Đã được đặt</span>
                        <span className="shift-status-badge status-busy"><i className="bi bi-lock-fill me-1"></i>Chưa mở
                        </span>
                    </div>

                </div>
            </div>
        </>
    );
}
