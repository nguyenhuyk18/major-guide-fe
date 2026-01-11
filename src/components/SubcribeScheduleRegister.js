import React from 'react';
import { DAY_IN_WEEK } from '../constants/constant';
import { convertVietnamese } from '../helpers/help';

export default function SubcribeScheduleRegister(props) {
    const { shift, shiftInDayList, chooseShiftInDay, handleOnclickChooseSchedule, handleDeleteSchedule } = props
    return (
        <>
            <div className="calendar-container">
                <table className="schedule-table">
                    <thead>
                        <tr>
                            <th className="col-time">CA / THỨ</th>
                            {DAY_IN_WEEK.map((row, indx) => <th key={indx}>
                                <div className="day-name">{convertVietnamese(row)}</div>
                                {/* <div className="day-number">16</div> */}
                            </th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {
                            shift.map((shiftData, indx) => {
                                return (
                                    <tr key={indx}>
                                        <td className="time-cell">
                                            <div className="time-label">{shiftData.name_shift}</div>
                                            <div className="time-value">{shiftData.start_time} - {shiftData.end_time}</div>
                                        </td>
                                        {
                                            DAY_IN_WEEK.map((day_in_week) => {
                                                return (shiftInDayList.map((shift_in_day, indx2) => {
                                                    if (shift_in_day.day === day_in_week && shift_in_day.shift_id.id === shiftData.id) {

                                                        // console.log(chooseShiftInDay)
                                                        if (chooseShiftInDay[shift_in_day.id]) {
                                                            return (
                                                                <td key={indx2} >
                                                                    <div className="slot-selected" shift_in_day_id={shift_in_day.id} >
                                                                        <button className="btn-close" onClick={() => {
                                                                            handleDeleteSchedule(shift_in_day.id)
                                                                        }} ><i className="bi bi-x"></i></button>
                                                                        <span>Đã chọn</span>
                                                                    </div>
                                                                </td>
                                                            )
                                                        }
                                                        else {
                                                            return (
                                                                <td key={indx2} >
                                                                    <div className="slot-empty" onClick={() => {
                                                                        handleOnclickChooseSchedule(shift_in_day.id)
                                                                    }} shift_in_day_id={shift_in_day.id} >
                                                                        <span>Khả dụng</span>
                                                                        <i className="bi bi-plus-circle"></i>
                                                                    </div>
                                                                </td>
                                                            )
                                                        }
                                                    }
                                                    return ''
                                                }))
                                            })
                                        }
                                    </tr>
                                )
                            }
                            )
                        }


                        {/* Sáng - Ca 1 */}
                        {/* <tr>
                            <td className="time-cell">
                                <div className="time-label"  >Sáng - Ca 1</div>
                                <div className="time-value">08:00</div>
                                <div className="time-separator">-</div>
                                <div className="time-value">10:00</div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-selected">
                                    <button className="btn-close"><i className="bi bi-x"></i></button>
                                    <span>Đã chọn</span>
                                </div>
                            </td>
                            <td className="col-active">
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-selected">
                                    <button className="btn-close"><i className="bi bi-x"></i></button>
                                    <span>Đã chọn</span>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                        </tr> */}

                        {/* Sáng - Ca 2 */}
                        {/* <tr>
                            <td className="time-cell">
                                <div className="time-label">Sáng - Ca 2</div>
                                <div className="time-value">10:00 - 12:00</div>
                            </td>
                            <td>
                                <div className="slot-selected">
                                    <button className="btn-close"  ><i className="bi bi-x" ></i></button>
                                    <span>Đã chọn</span>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td className="col-active">
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-selected">
                                    <button className="btn-close"><i className="bi bi-x"></i></button>
                                    <span>Đã chọn</span>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                        </tr> */}

                        {/* Chiều - Ca 1 */}
                        {/* <tr>
                            <td className="time-cell">
                                <div className="time-label">Chiều - Ca 1</div>
                                <div className="time-value">13:30</div>
                                <div className="time-separator">-</div>
                                <div className="time-value">15:30</div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td className="col-active">
                                <div className="slot-selected">
                                    <button className="btn-close"><i className="bi bi-x"></i></button>
                                    <span>Đã chọn</span>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                        </tr> */}

                        {/* Chiều - Ca 2 */}
                        {/* <tr>
                            <td className="time-cell">
                                <div className="time-label">Chiều - Ca 2</div>
                                <div className="time-value">15:30</div>
                                <div className="time-separator">-</div>
                                <div className="time-value">17:30</div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td className="col-active">
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                            <td>
                                <div className="slot-selected">
                                    <button className="btn-close"><i className="bi bi-x"></i></button>
                                    <span>Đã chọn</span>
                                </div>
                            </td>
                            <td>
                                <div className="slot-empty">
                                    <span>Khả dụng</span>
                                    <i className="bi bi-plus-circle"></i>
                                </div>
                            </td>
                        </tr> */}
                    </tbody>
                </table>
            </div>
        </>
    );
}
