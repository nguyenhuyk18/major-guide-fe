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
import { useSearchParams } from 'react-router-dom';
// import { useSearchParams } from 'react-router-dom';

export default function RegisterPage() {

    const [infoAllShiftInDay, setInfoAllShiftInDay] = useState(null);
    const [shiftList, setShiftList] = useState(null);
    const [dayInWeek, setDayInWeek] = useState(null);
    const [arrayDayInWeek, setArrInWeek] = useState([])

    //  useSearchParams là một cái hook nó giúp chúng ta có thể lấy các biến trên thanh url và đồng thời có thể vcaapj nhật lại thah url
    const [searchParam, setSearchParam] = useSearchParams();

    const endTime = searchParam.get('end_time') || null;
    const startTime = searchParam.get('start_time') || null;

    useEffect(() => {
        getDayInWeek(startTime);
        getShiftList();
    }, [endTime, startTime])

    const getDayInWeek = (startTime) => {
        const arr = getCurrentWeek(startTime || new Date());
        const numOfWeek = getWeekNumber(startTime || new Date())
        setArrInWeek(arr)
        const newEndDay = arr[arr.length - 1].setDate(arr[arr.length - 1].getDate() - 1)

        setDayInWeek({
            startDay: arr[0],
            endDay: new Date(newEndDay),
            numOfWeek: numOfWeek
        })

        getInfoAllShiftInDay(new Date(newEndDay), arr[0]);
    }

    const getInfoAllShiftInDay = async (endDay, startDay) => {
        try {
            const rs = await getShiftInDay(endDay, startDay);
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

        const tmp = getCurrentWeek(current)

        // getDayInWeek(current);

        const oldUrl = new URLSearchParams(searchParam.toString());
        oldUrl.set('start_time', `${tmp[0].getFullYear()}-${tmp[0].getMonth() + 1}-${tmp[0].getDate()}`)
        oldUrl.set('end_time', `${tmp[tmp.length - 1].getFullYear()}-${tmp[tmp.length - 1].getMonth() + 1}-${tmp[tmp.length - 1].getDate()}`)
        setSearchParam(oldUrl);
    }

    const handleCurrentWeek = () => {
        const current = new Date();
        const tmp = getCurrentWeek(current)


        const oldUrl = new URLSearchParams(searchParam.toString());
        oldUrl.set('start_time', `${tmp[0].getFullYear()}-${tmp[0].getMonth() + 1}-${tmp[0].getDate()}`)
        oldUrl.set('end_time', `${tmp[tmp.length - 1].getFullYear()}-${tmp[tmp.length - 1].getMonth() + 1}-${tmp[tmp.length - 1].getDate()}`)
        setSearchParam(oldUrl);

    }

    const handleNextWeek = () => {
        const current = new Date(dayInWeek['startDay']);

        const previousWeek = current.getDate() + 7;

        current.setDate(previousWeek);

        const tmp = getCurrentWeek(current)

        const oldUrl = new URLSearchParams(searchParam.toString());
        oldUrl.set('start_time', `${tmp[0].getFullYear()}-${tmp[0].getMonth() + 1}-${tmp[0].getDate()}`)
        oldUrl.set('end_time', `${tmp[tmp.length - 1].getFullYear()}-${tmp[tmp.length - 1].getMonth() + 1}-${tmp[tmp.length - 1].getDate()}`)
        setSearchParam(oldUrl);
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
            {infoAllShiftInDay && shiftList ? <RegisterScheduleAdmin arrayDayInWeek={arrayDayInWeek} infoAllShiftInDay={infoAllShiftInDay} shiftList={shiftList} /> : <Loading />}
        </div>

    );
}
