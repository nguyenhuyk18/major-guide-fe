import React, { useEffect, useState } from 'react';
import '../../../assets/css/ExpertMangeAdmin.css';
import { getListUser } from '../../../services/user-access.api';
import { toast } from 'react-toastify';
import { Link, useSearchParams } from 'react-router-dom';
import Loading from '../../../components/Loading';

export default function ExpertManagePage() {
    const [isLoading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState([]);
    const [totalPage, setTotalPage] = useState(0);

    const [searchParam, setSearchParam] = useSearchParams();

    const page = searchParam.get('page') || 1;
    const status = searchParam.get('status') || '';
    const name = searchParam.get('name') || '';

    useEffect(() => {
        getAllUser(page, status, name);
    }, [page, status, name]);

    const getAllUser = async (page = '', status = '', name = '') => {
        setIsLoading(true);
        try {
            const rs = await getListUser(page, status, name , 6, '', 'expert');
            
            if (!rs?.data?.data?.result?.length) {
                setUserList([]);
                setTotalPage(0);
                // toast.error('Không có chuyên gia nào thỏa điều kiện!');
                return;
            }

            const newResult = rs?.data?.data?.result.map(row => {
                return {
                    'Hình Ảnh': (
                        <div className="table-avatar-wrapper">
                            {row.fileAvartarUrl ? (
                                <img
                                    src={row.fileAvartarUrl}
                                    alt={row.name}
                                    className="table-avatar"
                                />
                            ) : (
                                <div className="table-avatar-placeholder">
                                    {getInitials(row.name)}
                                </div>
                            )}
                        </div>
                    ),
                    'Tên Chuyên gia': (
                        <div className="table-expert-info">
                            <span className="table-expert-name">{row.name}</span>
                            <span className="table-expert-id">ID: {row._id?.slice(-8) || '-'}</span>
                        </div>
                    ),
                    'Chuyên Môn': (
                        <div className="table-expert-specialty">
                            {row.expertProfile?.major || '-'}
                        </div>
                    ),
                    'Trạng Thái': (
                        <span className={`table-status-badge ${
                            row.statusAccount === 'active' ? 'status-active' :
                            row.statusAccount === 'busy' ? 'status-busy' : 'status-inactive'
                        }`}>
                            <i className={`bi ${
                                row.statusAccount === 'active' ? 'bi-check-circle-fill' :
                                row.statusAccount === 'busy' ? 'bi-clock-fill' : 'bi-pause-circle-fill'
                            }`}></i>
                            {row.statusAccount === 'active' ? 'Sẵn sàng' :
                             row.statusAccount === 'busy' ? 'Đang bận' : 'Ngừng'}
                        </span>
                    ),
                    'Liên hệ': (
                        <div className="table-contact-info">
                            {row.email && <span className="contact-item"><i className="bi bi-envelope"></i></span>}
                            {row.phone && <span className="contact-item"><i className="bi bi-telephone"></i></span>}
                        </div>
                    ),
                    'Các Tác Vụ': (
                        <div className="table-actions">
                            <button className="table-btn-action btn-view" title="Xem chi tiết">
                                <i className="bi bi-eye"></i>
                            </button>
                            <button className="table-btn-action btn-edit" title="Chỉnh sửa">
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button className="table-btn-action btn-delete" title="Xóa">
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    )
                };
            });

            setUserList(newResult);
            setTotalPage(rs.data.data.totalPage);
        } catch (error) {
            console.log(error);
            toast.error('Server đang bận, vui lòng thử lại sau!');
        } finally {
            setIsLoading(false);
        }
    };

    const getInitials = (name) => {
        if (!name) return 'E';
        const parts = name.split(' ');
        return parts[parts.length - 1].charAt(0).toUpperCase();
    };

    const handleChangeNextPage = () => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        const newPage = Number(page) + 1;
        oldUrl.set('page', newPage);
        setSearchParam(oldUrl);
    };

    const handleChangePrevious = () => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        const newPage = Number(page) - 1;
        oldUrl.set('page', newPage);
        setSearchParam(oldUrl);
    };

    const handleSearchChange = (e) => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        oldUrl.set('name', e.target.value);
        oldUrl.set('page', '1');
        setSearchParam(oldUrl);
    };

    const handleStatusChange = (e) => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        oldUrl.set('status', e.target.value);
        oldUrl.set('page', '1');
        setSearchParam(oldUrl);
    };

    return (
        <div className="expert-management">
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <h1 className="page-title">
                        <i className="bi bi-people-fill"></i>
                        Quản lý chuyên gia
                    </h1>
                    <p className="page-description">
                        Theo dõi, quản lý hồ sơ và trạng thái hoạt động của đội ngũ chuyên gia tư vấn.
                    </p>
                </div>
                <Link to={'/admin/experts/add'} className="btn-add-expert">
                    <i className="bi bi-plus-lg"></i>
                    Thêm chuyên gia mới
                </Link>
            </div>

            {/* Search and Filter Bar */}
            <div className="filter-bar">
                <div className="search-box">
                    <i className="bi bi-search search-icon"></i>
                    <input
                        type="text"
                        onChange={handleSearchChange}
                        className="search-input"
                        placeholder="Tìm kiếm theo tên chuyên gia..."
                        defaultValue={name}
                    />
                </div>
                <div className="filter-group">
                    <select className="filter-select" onChange={handleStatusChange} defaultValue={status}>
                        <option value=''>Tất cả trạng thái</option>
                        <option value='active'>Sẵn sàng</option>
                        <option value='busy'>Đang bận</option>
                        <option value='down'>Ngừng hoạt động</option>
                    </select>
                </div>
            </div>

            {/* Expert Table */}
            {isLoading ? (
                <Loading />
            ) : userList.length === 0 ? (
                <div className="empty-experts-state">
                    <i className="bi bi-people"></i>
                    <h3>Không có chuyên gia nào</h3>
                    <p>Thử thay đổi bộ lọc hoặc thêm chuyên gia mới.</p>
                </div>
            ) : (
                <div className="table-container">
                    <div className="table-responsive">
                        <table className="consultation-table">
                            <thead>
                                <tr>
                                    {Object.keys(userList[0]).map((header, index) => (
                                        <th key={index}>{header}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {userList.map((row, inx1) => (
                                    <tr key={inx1}>
                                        {Object.values(row).map((value, indx2) => (
                                            <td key={indx2}>{value}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="table-footer">
                        <div className="pagination-info">
                            Trang <strong>{page}</strong> / <strong>{totalPage}</strong>
                        </div>
                        <div className="pagination-controls">
                            <button
                                className="btn-pagination"
                                onClick={handleChangePrevious}
                                disabled={Number(page) === 1}
                            >
                                <i className="bi bi-chevron-left"></i>
                                Trước
                            </button>
                            <button
                                className="btn-pagination"
                                onClick={handleChangeNextPage}
                                disabled={Number(page) >= totalPage}
                            >
                                Sau
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
