// import React from 'react';

import { useEffect, useState } from "react";

import '../../assets/css/RegisterDetailPage.css'
import ScheduleDetailExpert from "../../components/ScheduleDetailExpert";
import { approveRegisterById, cancleRegisterById, getAllRegisterById, getAllShift, getShiftInDay } from "../../services/slot.api";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getUserAccess } from "../../services/user-access.api";
import { toast } from "react-toastify";
import Loading from "../../components/Loading";
import UserInfoCard from "../../components/UserInfoCard";

export default function RegisterDetailPage() {
    const [userInfo, setUserInfo] = useState(null);
    const [registerDetail, setRegisterDetail] = useState([]);
    const [shiftList, setShiftList] = useState([]);
    const [allShiftInDay, setAllShiftInDay] = useState(new Map())
    const [isLoading, setIsLoading] = useState(false);
    const [statusRegister, setStatusRegister] = useState(null);
    const navigate = useNavigate();
    const params = useParams();

    // console.log(userInfo);
    // console.log()

    // const navigate = useNavigate();
    useEffect(() => {

        getRegisterById()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const getRegisterById = async () => {
        try {
            const id = params.id_register;
            // console.log(id)
            const rs = await getAllRegisterById(id);
            // console.log(rs);
            const userResult = await getUserAccess(rs?.data?.data?.id_expert)
            const shiftResult = await getAllShift();
            const shiftInDayResult = await getShiftInDay();


            setStatusRegister(rs?.data?.data?.status)
            setShiftList(shiftResult?.data?.data?.data)
            setRegisterDetail(rs?.data?.data?.day);
            setUserInfo(userResult?.data?.data);
            setAllShiftInDay(shiftInDayResult?.data?.data);
            setIsLoading(true);
        } catch (error) {
            console.log(error)
            toast.error('Không có đơn đăng ký nào thử lại sau !!!!');
        }
    }

    const handleCancleRegister = async (id) => {
        try {
            await cancleRegisterById(id);
            toast.success('Hủy đơn đăng ký lịch thành công !!!');
            navigate('/admin/schedule-review')
        } catch (error) {
            console.log(error);
            toast.error('Hủy đơn đăng ký không thành công !!!')
            navigate('/admin/schedule-review')
        }
    }


    const handleApproveRegister = async (id) => {
        try {
            await approveRegisterById(id);
            toast.success('Duyệt đơn đăng ký lịch thành công !!!');
            navigate('/admin/schedule-review')
        } catch (error) {
            console.log(error);
            toast.error('Duyệt đơn đăng ký thất bại !!!')
            navigate('/admin/schedule-review')
        }
    }


    return (
        <>
            <div className="registration-detail">
                {/* Page Title */}
                <h1 className="page-title mb-4">Chi tiết Đăng ký</h1>

                {/* Breadcrumb */}
                <nav className="breadcrumb-nav mb-4">
                    <Link to={'/admin'} className="breadcrumb-link">Trang chủ</Link>
                    <span className="breadcrumb-separator">/</span>
                    <Link onClick={() => {
                        navigate(-1)
                    }} className="breadcrumb-link">Danh sách đơn đăng ký</Link>
                    <span className="breadcrumb-separator">/</span>
                    <span className="breadcrumb-current">Chi tiết đăng ký</span>
                </nav>

                {isLoading ? <>
                    <UserInfoCard userInfo={userInfo} idRegister={params.id_register} statusRegister={statusRegister} handleApproveRegister={handleApproveRegister} handleCancleRegister={handleCancleRegister} />
                    <div className="schedule-section">
                        <div className="section-header">
                            <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-calendar-check section-icon"></i>
                                <h3 className="section-title">Lịch đăng ký có định</h3>
                            </div>
                            <div className="legend">
                                <div className="legend-item">
                                    <span className="legend-dot registered"></span>
                                    <span>Đã đăng ký</span>
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot empty"></span>
                                    <span>Trống</span>
                                </div>
                            </div>
                        </div>

                        {/* Schedule Table */}
                        <ScheduleDetailExpert shiftList={shiftList} allShiftInDay={allShiftInDay} registerDetail={registerDetail} />
                    </div>

                </> : <Loading />}

            </div>
        </>
    );
}
