// import React from 'react';
import { useEffect, useState } from 'react';
import '../../assets/css/ReviewRegisterPage.css'
import FilterReviewRegister from '../../components/FilterReviewRegister';
import RegisterReviewCard from '../../components/RegisterReviewCard';
import TableDisplay from '../../components/TableDisplay';
import { getAllRegister } from '../../services/slot.api';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import Loading from '../../components/Loading';

export default function ReviewRegisterPage() {

    const [registerList, setRegisterList] = useState([]);
    const [totalPage, setTotalPage] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    //  useSearchParams là một cái hook nó giúp chúng ta có thể lấy các biến trên thanh url và đồng thời có thể vcaapj nhật lại thah url
    const [searchParam, setSearchParam] = useSearchParams();

    const page = searchParam.get('page') || '';
    const status = searchParam.get('status') || '';


    // getAllRegister
    // eslint-disable-next-line
    useEffect(() => {
        getRegisterList()
    }, [page, status])


    const handleChangeNextPage = () => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        let nextPage = 0;
        if (!page) nextPage += 2;
        else nextPage = Number(page) + 1;

        oldUrl.set('page', nextPage);
        // oldUrl.set('status', status);
        setSearchParam(oldUrl);
    }


    const handleChangePrevious = () => {
        const oldUrl = new URLSearchParams(searchParam.toString());
        let nextPage = 0;
        nextPage = Number(page) - 1;


        oldUrl.set('page', nextPage);
        // oldUrl.set('status', status);
        setSearchParam(oldUrl);
    }

    // eslint-disable-next-line
    const getRegisterList = async () => {
        try {
            const rs = await getAllRegister(page, status);

            const registers = rs.data.data.result.map(row => {
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
                            {/* <div className="expert-role">Digital Marketing Expert</div> */}
                        </div>
                    ),
                    'Ngày Đăng Ký': (

                        <div className='time-cell'>
                            <i className="bi bi-calendar3 me-2"></i>
                            <div>
                                <div className="time-date">{(new Date(row.createdAt)).toLocaleDateString('vi')}</div>
                            </div>
                        </div>
                    ),
                    'Trạng Thái Đơn': (
                        row.status === "approve" ? <span className="status-badge status-approved">
                            <i className="bi bi-dot"></i>
                            Chờ duyệt
                        </span> : row.status === "unreviewed" ? <span className="status-badge status-pending ">
                            <i className="bi bi-dot"></i>
                            Chưa Duyệt
                        </span> : row.status === "cancle" ? <span className="status-badge status-cancelled ">
                            <i className="bi bi-dot"></i>
                            Hủy
                        </span> : ''
                    ),
                }
            })

            setRegisterList(registers);
            setTotalPage(rs.data.data.totalPage)
            setIsLoading(true);



        } catch (error) {
            toast.error('server đang bận thử lại sau !!!');
        }
    }

    return (
        <>
            <div className="consultation-management">
                {/* Header Section */}
                <div className="page-header mb-4">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h1 className="page-title">Quản lý Đăng ký Buổi Tư vấn</h1>
                            <p className="page-subtitle">Xem xét và phê duyệt các buổi tư vấn từ chuyên gia mới gia nhập.</p>
                        </div>
                        {/* <button className="btn btn-add-request">
                            <i className="bi bi-plus-lg me-2"></i>
                            Tạo yêu cầu mới
                        </button> */}
                    </div>
                </div>

                {/* Statistics Cards */}
                <RegisterReviewCard />

                {/* Filter Tabs */}
                <FilterReviewRegister />

                {/* Table Section */}
                {!isLoading ? <Loading /> : <TableDisplay handleChangePrevious={handleChangePrevious} handleChangeNextPage={handleChangeNextPage} listData={registerList} totalPage={totalPage} currentPage={page || 1} />}
            </div>
        </>
    );
}
