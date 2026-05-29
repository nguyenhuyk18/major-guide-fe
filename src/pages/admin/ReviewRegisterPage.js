// import React from 'react';
import { useEffect, useState } from 'react';
import '../../assets/css/ReviewRegisterPage.css'
import { getAllRegister } from '../../services/slot.api';
import { toast } from 'react-toastify';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Loading from '../../components/Loading';

export default function ReviewRegisterPage() {
    const navigate = useNavigate();

    const [registerList, setRegisterList] = useState([]);
    const [totalPage, setTotalPage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const [searchParam, setSearchParam] = useSearchParams();
    const page = searchParam.get('page') || '';
    const status = searchParam.get('status') || '';

    // eslint-disable-next-line
    useEffect(() => {
        getRegisterList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, status]);

    const handleChangeNextPage = () => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        let nextPage = 0;
        if (!page) nextPage += 2;
        else nextPage = Number(page) + 1;
        oldUrl.set('page', nextPage);
        setSearchParam(oldUrl);
    };

    const handleChangePrevious = () => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        const nextPage = Number(page) - 1;
        oldUrl.set('page', nextPage);
        setSearchParam(oldUrl);
    };

    // eslint-disable-next-line
    const getRegisterList = async () => {
        try {
            const rs = await getAllRegister(page, status);

            const registers = rs?.data?.data?.result.map(row => {
                const statusMap = {
                    'approve': { cls: 'rrp-badge--approved', label: 'Đã duyệt' },
                    'unreviewed': { cls: 'rrp-badge--pending', label: 'Chưa duyệt' },
                    'cancle': { cls: 'rrp-badge--cancelled', label: 'Hủy' },
                };
                const s = statusMap[row.status] || {};
                return {
                    'Hình Ảnh': (
                        <img
                            src={row.fileAvartarUrl}
                            alt={row.name}
                            className="rrp-avatar"
                        />
                    ),
                    'Tên Chuyên gia': (
                        <div className="rrp-expert-name">{row.name}</div>
                    ),
                    'Ngày Đăng Ký': (
                        <div className="rrp-time-cell">
                            <i className="bi bi-calendar3"></i>
                            <span className="rrp-time-date">
                                {(new Date(row.createdAt)).toLocaleDateString('vi')}
                            </span>
                        </div>
                    ),
                    'Trạng Thái Đơn': (
                        row.status ? (
                            <span className={`rrp-badge ${s.cls || ''}`}>
                                <i className="bi bi-dot"></i>
                                {s.label || row.status}
                            </span>
                        ) : null
                    ),
                    'Hành Động': (
                        <Link to={`/admin/review-detail/${row._id}`} className="rrp-action-btn" title="Xem chi tiết">
                            <i className="bi bi-eye"></i>
                        </Link>
                    )
                };
            });

            setRegisterList(registers);
            setTotalPage(rs?.data?.data?.totalPage);
            setIsLoading(true);

        } catch (error) {
            console.log(error);
            setIsLoading(false);
            setRegisterList([]);
            if (error?.response?.status === 403) {
                toast.error('Bạn không có thẩm quyền để vào đây !!!');
                navigate('/admin');
                return;
            }
            toast.error(error?.response?.data?.message || 'Server đang bận, thử lại sau');
        }
    };

    const handleFindByStatus = (statusVal) => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        oldUrl.set('status', statusVal);
        oldUrl.set('page', 1);
        setSearchParam(oldUrl);
    };

    return (
        <div className="rrp-wrapper">
            {/* Header */}
            <div className="rrp-header">
                <div className="rrp-header-row">
                    <div>
                        <h1 className="rrp-heading">Quản lý Đăng ký Buổi Tư vấn</h1>
                        <p className="rrp-subheading">Xem xét và phê duyệt các buổi tư vấn từ chuyên gia mới gia nhập.</p>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="rrp-filters">
                <button
                    className={`rrp-filter-btn ${status === '' ? 'is-active' : ''}`}
                    onClick={() => handleFindByStatus('')}
                >
                    <i className="bi bi-list-ul"></i>
                    Tất cả
                </button>
                <button
                    className={`rrp-filter-btn ${status === 'unreviewed' ? 'is-active' : ''}`}
                    onClick={() => handleFindByStatus('unreviewed')}
                >
                    <i className="bi bi-clock"></i>
                    Chờ duyệt
                </button>
                <button
                    className={`rrp-filter-btn ${status === 'approve' ? 'is-active' : ''}`}
                    onClick={() => handleFindByStatus('approve')}
                >
                    <i className="bi bi-check-circle"></i>
                    Đã chấp nhận
                </button>
                <button
                    className={`rrp-filter-btn ${status === 'cancle' ? 'is-active' : ''}`}
                    onClick={() => handleFindByStatus('cancle')}
                >
                    <i className="bi bi-x-circle"></i>
                    Đã hủy
                </button>
            </div>

            {/* Table */}
            {!isLoading ? (
                <div className="rrp-loading">
                    <div className="rrp-loading-spinner"></div>
                    <span className="rrp-loading-text">Đang tải dữ liệu...</span>
                </div>
            ) : (
                <div className="rrp-table-card">
                    <div className="rrp-table-scroll">
                        <table className="rrp-table">
                            <thead>
                                <tr>
                                    {Object.keys(registerList[0] || {}).map((key, idx) => (
                                        <th key={idx}>{key}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {registerList.map((row, idx) => (
                                    <tr key={idx}>
                                        {Object.values(row).map((cell, ci) => (
                                            <td key={ci}>{cell}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                        <div className="rrp-footer">
                        <div className="rrp-page-info">
                            Trang <strong>{page || 1}</strong> / <strong>{totalPage}</strong>
                        </div>
                        <div className="rrp-page-controls">
                            <button
                                className="rrp-page-btn"
                                onClick={handleChangePrevious}
                                disabled={Number(page || 1) === 1}
                            >
                                <i className="bi bi-chevron-left me-1"></i>
                                Trước
                            </button>
                            <button
                                className="rrp-page-btn"
                                onClick={handleChangeNextPage}
                                disabled={Number(page || 1) >= Number(totalPage)}
                            >
                                Sau
                                <i className="bi bi-chevron-right ms-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
