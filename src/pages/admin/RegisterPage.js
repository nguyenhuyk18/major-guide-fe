// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import '../../assets/css/RegisterAdmin.css'
import RegisterScheduleAdmin from '../../components/RegisterScheduleAdmin';
import { useEffect, useState } from 'react';
import { getAllShift, getShiftInDay } from '../../services/slot.api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';

export default function RegisterPage() {



    // const navigate = useNavigate()
    const [infoAllShiftInDay, setInfoAllShiftInDay] = useState(null);
    const [shiftList, setShiftList] = useState(null);

    useEffect(() => {
        getInfoAllShiftInDay();
        getShiftList();
    }, [])


    const getInfoAllShiftInDay = async () => {
        try {
            const rs = await getShiftInDay();
            // console.log(rs);
            setInfoAllShiftInDay(rs.data.data);

        } catch (error) {
            console.log(error)
            toast.error('Server đang bận, hãy thử lại sau !!!')
            // navigate('/admin')
        }
    }


    const getShiftList = async () => {
        try {
            const rs = await getAllShift();
            setShiftList(rs.data.data.data);
        } catch (error) {
            console.log(error)
            toast.error('Server đang bận, hãy thử lại sau !!!')
            // navigate('/admin')
        }
    }

    return (

        <div className="register-page">
            {/* Header Section */}
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-title mb-2">Lịch đăng ký tư vấn</h2>
                </div>
            </div>

            {/* Calendar Grid */}
            {infoAllShiftInDay && shiftList ? <RegisterScheduleAdmin infoAllShiftInDay={infoAllShiftInDay} shiftList={shiftList} /> : <Loading />}
        </div>

    );
}
