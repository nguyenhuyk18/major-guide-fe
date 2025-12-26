
// import { useState } from 'react';
import DayInWeek from './DayInWeek';
import DisplayEmptyShift from './DisplayEmptyShift';
import DisplayNumberExpert from './DisplayNumberExpert';
// import { getShiftInDay } from '../services/slot.api';
// import { useNavigate } from 'react-router-dom';
import TimeSlotLabel from './TimeSlotLabel';
import { DAY_IN_WEEK } from '../constants/constant';
// import { toast } from 'react-toastify';


export default function RegisterScheduleAdmin(props) {



    const { infoAllShiftInDay, shiftList } = props
    console.log(infoAllShiftInDay)
    return (
        <>
            <div className="calendar-container">
                <div className="table-responsive">
                    <table className="calendar-table">

                        <DayInWeek />

                        <tbody>
                            {shiftList.map((shift, inx) => {
                                return (
                                    <tr key={inx} >
                                        <TimeSlotLabel nameShift={shift.name_shift} endTime={shift.end_time} startTime={shift.start_time} />
                                        {DAY_IN_WEEK.map(day_in_week => {

                                            return infoAllShiftInDay.map((shiftInDay, inx1) => {
                                                if (shiftInDay.day === day_in_week && shiftInDay.shiftInfo.id === shift.id) {
                                                    return shiftInDay.amount ? <td key={inx1}>
                                                        <DisplayNumberExpert numberOfExpert={shiftInDay.amount} shiftInDayId={shiftInDay.id} />
                                                    </td> : <td key={inx1} >
                                                        <DisplayEmptyShift />
                                                    </td>
                                                }
                                                return '';
                                            })
                                        })}
                                    </tr>
                                )
                            })}
                        </tbody>

                    </table>
                </div>
            </div >
        </>
    );
}
