// import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import '../../assets/css/ShiftDetailAdmin.css'
import ShiftDetailHeader from '../../components/ShiftDetailHeader';
import FilterBarShiftDetail from '../../components/FilterBarShiftDetail';
import { useEffect, useState } from 'react';
import { getShiftById } from '../../services/slot.api';
import { toast } from 'react-toastify';
import ExpertListAdmin from '../../components/ExpertListAdmin';
import Loading from '../../components/Loading';

export default function ShiftDetailPage() {

    const params = useParams();

    const [userList, setUserList] = useState(null)
    const [shiftInfo, setShiftInfo] = useState(null)

    useEffect(() => {
        getUserInShift();
    }, [])

    const getUserInShift = async () => {
        try {
            const rs = await getShiftById(params.id_shift_day);

            // console.log(rs)

            setUserList(rs.data.data.register);
            setShiftInfo(rs.data.data.shiftInfo);
        } catch (error) {
            toast.error('Server đang bận, hãy thử lại sau !!!');
        }


    }

    return (
        <>
            <div className="consultation-detail">
                {/* Breadcrumb */}
                <nav className="breadcrumb-nav mb-4">
                    <Link to="/admin" className="breadcrumb-item">Dashboard</Link>
                    <i className="bi bi-chevron-right"></i>
                    <Link to="/admin/register" className="breadcrumb-item">Quản lý lịch</Link>
                    <i className="bi bi-chevron-right"></i>
                    <span className="breadcrumb-item active">Chi tiết ca tư vấn</span>
                </nav>

                {/* Session Header */}
                {!shiftInfo ? '' : <ShiftDetailHeader shiftInfo={shiftInfo} />}

                {/* Filter and Actions Bar */}
                <FilterBarShiftDetail />

                {/* Experts Grid */}
                {userList && shiftInfo ? <ExpertListAdmin expertList={userList} /> : <Loading />}

            </div>
        </>
    );
}
