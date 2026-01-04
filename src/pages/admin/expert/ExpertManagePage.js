import React, { useEffect, useState } from 'react';
import '../../../assets/css/ExpertMangeAdmin.css'
import { getListUser } from '../../../services/user-access.api';
import { toast } from 'react-toastify';
import TableDisplay from '../../../components/TableDisplay';
import { Link, useSearchParams } from 'react-router-dom';
import Loading from '../../../components/Loading';

export default function ExpertManagePage() {

    const [isLoading, setIsLoading] = useState(false);
    const [userList, setUserList] = useState([]);
    const [totalPage, setTotalPage] = useState(0);

    const [searchParam, setSearchParam] = useSearchParams();

    const page = searchParam.get('page') || '';
    // const status = searchParam.get('status') || '';

    useEffect(() => {
        getAllUser();
    }, [])

    const getAllUser = async () => {
        try {
            const rs = await getListUser();
            // console.log(rs.data.data.result);
            const newResult = rs?.data?.data?.result.map(row => {
                return {

                    // SỬA Ở ĐÂY: Bỏ dấu `` (string literal) và viết thẳng JSX
                    'Hình Ảnh': (
                        <img
                            src={row.fileAvartarUrl}
                            alt={row.name}
                            className="expert-avatar"
                        />
                    ),
                    'Tên Chuyên gia': (
                        <div className="expert-info">
                            <div className="expert-name">{row.name}</div>
                            {/* <div className="expert-id">ID: EXP-001</div> */}
                        </div>
                    ),
                    'Đánh Giá': (
                        <div className="rating-cell">
                            <i className="bi bi-star-fill rating-icon"></i>
                            <span className="rating-value">4.9</span>
                            <span className="rating-count">(120 đánh giá)</span>
                        </div>
                    ),
                    'Trạng Thái': (

                        <span className="status-badge status-available">
                            {/* <i className="bi bi-circle-fill status-dot"></i> */}
                            Sẵn sàng
                        </span>
                    ),
                    'Các Tác Vụ': (
                        <div className="action-buttons">
                            <button className="btn-action btn-view" title="Xem chi tiết">
                                <i className="bi bi-eye"></i>
                            </button>
                            <button className="btn-action btn-edit" title="Chỉnh sửa">
                                <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn-action btn-delete" title="Xóa">
                                <i className="bi bi-trash"></i>
                            </button>
                        </div>
                    )
                }
            })

            setUserList(newResult);
            setTotalPage(rs.data.data.totalPage);
            setIsLoading(true);
        } catch (error) {
            console.log(error);
            toast.error('Server đang bận, vui lòng thử lại sau !!!');
        }
    }

    const handleChangeNextPage = () => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        // oldUrl.set('status', status);
        oldUrl.set('page', 1);
        // oldUrl.set('status', status);
        setSearchParam(oldUrl);
    }


    const handleChangePrevious = () => {
        alert('gferfbgergergerergergergherher');
    }

    return (
        <>
            <div className="expert-management">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-content">
                        <h1 className="page-title">Danh sách chuyên gia</h1>
                        <p className="page-description">
                            Quản lý hồ sơ, chuyên môn và theo dõi trạng thái hoạt động của đội ngũ chuyên gia tư vấn.
                        </p>
                    </div>
                    <button className="btn-add-expert">
                        <i className="bi bi-plus-lg me-2"></i>
                        Thêm chuyên gia mới
                    </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="filter-bar">
                    <div className="search-box">
                        <i className="bi bi-search search-icon"></i>
                        <input
                            type="text"
                            className="search-input"
                            placeholder="Tìm kiếm theo tên, email hoặc mã chuyên gia..."
                        />
                    </div>
                    <div className="filter-group">
                        <select className="filter-select">
                            <option>Tất cả trạng thái</option>
                            <option>Sẵn sàng</option>
                            <option>Đang bận</option>
                            <option>Ngừng hoạt động</option>
                        </select>
                        <select className="filter-select">
                            <option>Tất cả trạng thái</option>
                            <option>Sẵn sàng</option>
                            <option>Đang bận</option>
                            <option>Ngừng hoạt động</option>
                        </select>
                    </div>
                </div>

                {/* Expert Table */}
                {isLoading ? <TableDisplay listData={userList} totalPage={totalPage} currentPage={page} handleChangeNextPage={handleChangeNextPage} handleChangePrevious={handleChangePrevious} /> : <Loading />}

            </div>
        </>
    );
}
