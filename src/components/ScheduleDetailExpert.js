// import React from 'react';

import { DAY_IN_WEEK } from "../constants/constant";

export default function ScheduleDetailExpert(props) {
    const { shiftList, registerDetail, allShiftInDay } = props
    // console.log(shiftList);
    // console.log(registerDetail)
    // console.log(allShiftInDay)

    // cái này lấy xét mã include
    const allShiftRegister = registerDetail.map(row => row.id);
    // console.log(allShiftRegister)
    return (
        <>
            <div className="schedule-table-wrapper">
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th className="time-header">CA / THỨ</th>
                            <th>THỨ 2</th>
                            <th>THỨ 3</th>
                            <th>THỨ 4</th>
                            <th>THỨ 5</th>
                            <th>THỨ 6</th>
                            <th>THỨ 7</th>
                            {/* <th>CN</th> */}
                        </tr>
                    </thead>
                    <tbody>

                        {
                            shiftList.map(row => <tr>
                                <td className="time-cella">
                                    <div className="time-label">{row.name_shift}</div>
                                    <div className="time-range">{row.start_time} - {row.end_time}</div>
                                </td>
                                {DAY_IN_WEEK.map(row1 => {
                                    const tmp = allShiftInDay.find(row3 => {
                                        if (row3.day === row1 && row._id === row3.shiftInfo.id) {
                                            return true;
                                        }
                                        return false;
                                    })

                                    if (allShiftRegister.includes(tmp.id)) {
                                        return <td><div className="schedule-slot registered-slot">
                                            <i className="bi bi-check-circle-fill slot-icon"></i>
                                            <span className="slot-text">Đã đăng ký</span>
                                        </div></td>
                                    }

                                    return <td><div className="schedule-slot empty-slot">
                                        <span className="slot-text">Trống</span>
                                    </div></td>

                                })
                                }


                            </tr>)
                        }
                    </tbody>
                </table>
            </div>
        </>
    );
}
