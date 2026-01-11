import React, { useEffect, useState } from 'react';
import '../../../assets/css/RegisterSubcribe.css'
import { addSlot, getAllShift, getShiftInDayOnly } from '../../../services/slot.api';
import SubcribeScheduleRegister from '../../../components/SubcribeScheduleRegister';
import { toast } from 'react-toastify';
import Loading from '../../../components/Loading';
import { useNavigate } from 'react-router-dom';

export default function SubcribeRegister() {
    const navigate = useNavigate()

    const [shift, setShift] = useState([]);
    const [shiftInDayList, setShiftInDayList] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chooseShiftInDay, setChooseShiftInDay] = useState({});

    useEffect(() => {
        getData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getData = async () => {
        try {
            const rs = await getAllShift();
            const rs1 = await getShiftInDayOnly();
            const arr = {};
            rs1.data.data.forEach(row => {
                arr[row.id] = 0;
            })
            setChooseShiftInDay(arr);

            setShift(rs.data.data.data);
            setShiftInDayList(rs1.data.data);
            setIsLoading(true);

        } catch (error) {
            // console.log(error)
            setIsLoading(false);
            toast.error(error?.response?.data?.message || 'server đang bận !!!');
            navigate('/admin')
        }
    }

    const handleSubmitSchedule = async () => {
        const values = Object.values(chooseShiftInDay);

        if (!values.includes(1)) {
            toast.error('Vui Lòng Chọn Lịch Đăng Ký !!!');
        }
        let newData = [];

        for (const key in chooseShiftInDay) {
            if (chooseShiftInDay[key]) {
                newData.push(key);
            }
        }

        // const newData = chooseShiftInDay.map((row, idnx) => {
        //     if (row) {
        //         return idnx;
        //     }
        // })


        // console.log(newData)
        try {
            await addSlot({ day: newData });
            toast.success('Đăng ký lịch thành công, đợi quản trị viên duyệt');
            navigate('/admin')
        } catch (error) {
            console.log(error);
            toast.error('lỗi khi thêm lịch đăng ký');

        }


    }

    const handleOnclickChooseSchedule = (id_shift_in_day) => {
        // const 
        chooseShiftInDay[id_shift_in_day] = 1;
        setChooseShiftInDay({ ...chooseShiftInDay });

    }

    const handleDeleteSchedule = (id_shift_in_day) => {
        chooseShiftInDay[id_shift_in_day] = 0;
        setChooseShiftInDay({ ...chooseShiftInDay });
    }

    return (
        <>
            <div className="work-schedule-page">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left">
                        <h1 className="page-title">Đăng ký lịch cho chuyên gia</h1>
                        {/* <div className="week-info">
                            <i className="bi bi-calendar3"></i>
                            <span>Tuần 42: 16/10 - 22/10/2023</span>
                        </div> */}
                    </div>
                    <div className="header-actions">
                        <button className="btn-register" onClick={handleSubmitSchedule} >
                            <i className="bi bi-check-circle me-2"></i>
                            Đăng ký lịch đã chọn
                        </button>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="filter-tabs">
                    <button className="tab-btn">
                        <i className="bi bi-circle-fill"></i>
                        Trống (Khả dụng)
                    </button>
                    <button className="tab-btn active">
                        <i className="bi bi-circle-fill"></i>
                        Đã chọn
                    </button>
                </div>

                {/* Calendar Table */}
                {!isLoading ? <Loading></Loading> : <SubcribeScheduleRegister shift={shift} shiftInDayList={shiftInDayList} chooseShiftInDay={chooseShiftInDay} handleOnclickChooseSchedule={handleOnclickChooseSchedule} handleDeleteSchedule={handleDeleteSchedule} />}
            </div>
        </>
    );
}
