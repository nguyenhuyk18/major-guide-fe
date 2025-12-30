

import React from 'react';
import { DAY_IN_WEEK } from '../constants/constant';
import { convertVietnamese } from '../helpers/help';

export default function DayInWeek({ arrayDayInWeek }) {
    const dayInWeek = DAY_IN_WEEK;
    const currentDate = new Date()
    return (
        <thead>
            <tr>
                <th className="time-column">CA / THỨ</th>
                {dayInWeek.map((row, idnx) =>
                    <th key={idnx}>
                        <div className="day-header" >
                            {/* <div className="day-name">{convertVietnamese(row)}</div> */}

                            <div className="day-name">{convertVietnamese(row)}</div>
                            <div className="day-number">{arrayDayInWeek[idnx].getDate()}/{arrayDayInWeek[idnx].getMonth() + 1}</div>
                            {currentDate.getDate() === arrayDayInWeek[idnx].getDate() && currentDate.getFullYear() === arrayDayInWeek[idnx].getFullYear() && currentDate.getMonth() === arrayDayInWeek[idnx].getMonth() ? <div className="day-dot"></div> : ''}

                        </div>
                    </th>)}



                {/* <th>
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
                </th> */}
            </tr>
        </thead>
    );
}
