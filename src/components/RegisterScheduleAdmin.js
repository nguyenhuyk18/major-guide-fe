// import React from 'react';
// import { Link } from 'react-router-dom';
import DisplayEmptyShift from './DisplayEmptyShift';
import DisplayNumberExpert from './DisplayNumberExpert';

export default function RegisterScheduleAdmin() {
    return (
        <>
            <div className="calendar-container">
                <div className="table-responsive">
                    <table className="calendar-table">

                        <thead>
                            <tr>
                                <th className="time-column">CA / THỨ</th>
                                <th>
                                    <div className="day-header">
                                        <div className="day-name">THỨ 2</div>
                                    </div>
                                </th>
                                <th>
                                    <div className="day-header">
                                        <div className="day-name">THỨ 3</div>
                                    </div>
                                </th>
                                <th>
                                    <div className="day-header">
                                        <div className="day-name">THỨ 4</div>
                                    </div>
                                </th>
                                <th>
                                    <div className="day-header">
                                        <div className="day-name">THỨ 5</div>
                                    </div>
                                </th>
                                <th>
                                    <div className="day-header">
                                        <div className="day-name">THỨ 6</div>
                                    </div>
                                </th>
                                <th>
                                    <div className="day-header">
                                        <div className="day-name">THỨ 7</div>
                                    </div>
                                </th>
                            </tr>
                        </thead>

                        <tbody>

                            <tr>
                                <td className="time-column">
                                    <div className="time-slot-label">
                                        <div className="slot-name">Sáng - Ca 1</div>
                                        <div className="slot-time">08:00 - 10:00</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments">
                                        <DisplayNumberExpert numberOfExpert={10} />
                                        {/* <div className="status-indicator status-confirmed"></div> */}
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments pending">
                                        <div className="cell-content">
                                            <div className="appointment-count">1</div>
                                            <div className="appointment-label">chuyên gia</div>
                                            <button className="btn btn-detail btn-sm mt-2">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                        <div className="status-indicator status-pending"></div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments pending">
                                        <div className="cell-content">
                                            <div className="appointment-count">1</div>
                                            <div className="appointment-label">chuyên gia</div>
                                            <button className="btn btn-detail btn-sm mt-2">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                        <div className="status-indicator status-pending"></div>
                                    </div>
                                </td>
                            </tr>


                            <tr>
                                <td className="time-column">
                                    <div className="time-slot-label">
                                        <div className="slot-name">Sáng - Ca 2</div>
                                        <div className="slot-time">10:00 - 12:00</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments confirmed">
                                        <div className="cell-content">
                                            <div className="appointment-count">2</div>
                                            <div className="appointment-label">chuyên gia</div>
                                            <button className="btn btn-detail btn-sm mt-2">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                        {/* <div className="status-indicator status-confirmed"></div> */}
                                    </div>
                                </td>
                                <td>
                                    <DisplayEmptyShift />
                                </td>
                                <td>
                                    <DisplayEmptyShift />
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments pending">
                                        <div className="cell-content">
                                            <div className="appointment-count">1</div>
                                            <div className="appointment-label">chuyên gia</div>
                                            <button className="btn btn-detail btn-sm mt-2">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                        {/* <div className="status-indicator status-pending"></div> */}
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td className="time-column">
                                    <div className="time-slot-label">
                                        <div className="slot-name">Chiều - Ca 1</div>
                                        <div className="slot-time">13:30 - 15:30</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments pending">
                                        <div className="cell-content">
                                            <div className="appointment-count">1</div>
                                            <div className="appointment-label">chuyên gia</div>
                                            <button className="btn btn-detail btn-sm mt-2">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                        <div className="status-indicator status-pending"></div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments confirmed">
                                        <div className="cell-content">
                                            <div className="appointment-count">3</div>
                                            <div className="appointment-label">chuyên gia</div>
                                            <button className="btn btn-detail btn-sm mt-2">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                        <div className="status-indicator status-confirmed"></div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments pending">
                                        <div className="cell-content">
                                            <div className="appointment-count">1</div>
                                            <div className="appointment-label">chuyên gia</div>
                                            <button className="btn btn-detail btn-sm mt-2">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                        <div className="status-indicator status-pending"></div>
                                    </div>
                                </td>
                            </tr>

                            <tr>
                                <td className="time-column">
                                    <div className="time-slot-label">
                                        <div className="slot-name">Chiều - Ca 2</div>
                                        <div className="slot-time">15:30 - 17:30</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments confirmed">
                                        <div className="cell-content">
                                            <div className="appointment-count">2</div>
                                            <div className="appointment-label">chuyên gia</div>
                                            <button className="btn btn-detail btn-sm mt-2">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                        <div className="status-indicator status-confirmed"></div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell has-appointments pending">
                                        <div className="cell-content">
                                            <div className="appointment-count">1</div>
                                            <div className="appointment-label">chuyên gia</div>
                                            <button className="btn btn-detail btn-sm mt-2">
                                                Xem chi tiết
                                            </button>
                                        </div>
                                        <div className="status-indicator status-pending"></div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                                <td>
                                    <div className="schedule-cell empty-cell">
                                        <div className="cell-content">Trống</div>
                                    </div>
                                </td>
                            </tr>
                        </tbody>

                    </table>
                </div>
            </div>
        </>
    );
}
