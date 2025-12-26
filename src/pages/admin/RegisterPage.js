// import React, { useState } from 'react';
// import { Link } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
import '../../assets/css/RegisterAdmin.css'
import RegisterScheduleAdmin from '../../components/RegisterScheduleAdmin';
import { useEffect, useState } from 'react';
import { getAllShift, getShiftInDay } from '../../services/slot.api';
import { toast } from 'react-toastify';
import Loading from '../../components/Loading';
import { getCurrentWeek, getWeekNumber } from '../../helpers/help';

export default function RegisterPage() {

    // const navigate = useNavigate()
    const [infoAllShiftInDay, setInfoAllShiftInDay] = useState(null);
    const [shiftList, setShiftList] = useState(null);
    const [dayInWeek, setDayInWeek] = useState(null);
    // const [endDayInWeek, setEndDayInWeek] = useState();
    // const [numberOfWeek, setNumberOfWeek] = useState();

    useEffect(() => {
        getDayInWeek();
        getInfoAllShiftInDay();
        getShiftList();
    }, [])

    const getDayInWeek = (day = new Date()) => {
        const arr = getCurrentWeek(day);
        const numOfWeek = getWeekNumber(day)

        setDayInWeek({
            startDay: arr[0],
            endDay: arr[arr.length - 1],
            numOfWeek: numOfWeek
        })
    }

    const getInfoAllShiftInDay = async () => {
        try {
            const rs = await getShiftInDay();
            setInfoAllShiftInDay(rs.data.data);

        } catch (error) {
            console.log(error)
            toast.error('Server đang bận, hãy thử lại sau !!!')
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


    const handlePreviousWeek = () => {
        const current = new Date(dayInWeek['startDay']);

        const previousWeek = current.getDate() - 7;

        current.setDate(previousWeek);

        getDayInWeek(current);
    }

    const handleCurrentWeek = () => {
        const current = new Date();
        getDayInWeek(current);
    }

    const handleNextWeek = () => {
        const current = new Date(dayInWeek['startDay']);

        const previousWeek = current.getDate() + 7;

        current.setDate(previousWeek);

        getDayInWeek(current);
    }

    return (

        <div className="register-page">
            {/* Header Section */}
            <div className="page-header d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h2 className="page-title mb-2">Lịch đăng ký tư vấn</h2>
                    <div className="week-info d-flex align-items-center text-muted">
                        <i className="bi bi-calendar3 me-2" style={{ color: '#fff' }}></i>
                        {dayInWeek ? <span style={{ color: '#fff' }} >Tuần {dayInWeek['numOfWeek']}: {dayInWeek['startDay'].toLocaleDateString("vi-VN")} - {dayInWeek['endDay'].toLocaleDateString("vi-VN")}</span> : ''}
                    </div>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn btn-week-nav" onClick={handlePreviousWeek} >
                        <i className="bi bi-chevron-left me-2"></i>
                        Tuần trước
                    </button>
                    <button className="btn btn-week-nav" onClick={handleCurrentWeek}>
                        Tuần hiện tại
                        {/* <i className="bi bi-chevron-right ms-2"></i> */}
                    </button>
                    <button className="btn btn-week-nav" onClick={handleNextWeek}>
                        Tuần sau
                        <i className="bi bi-chevron-right ms-2"></i>
                    </button>
                </div>
            </div>

            {/* Calendar Grid */}
            {infoAllShiftInDay && shiftList ? <RegisterScheduleAdmin infoAllShiftInDay={infoAllShiftInDay} shiftList={shiftList} /> : <Loading />}
        </div>

    );
}
