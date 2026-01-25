// import React from 'react';

export default function TimeSlotLabel(props) {

    const { endTime, startTime, nameShift } = props;


    return (
        <>
            <td className="time-column time-column-1">
                <div className="time-slot-label">
                    <div className="slot-name">{nameShift}</div>
                    <div className="slot-time">{startTime} - {endTime}</div>
                </div>
            </td>
        </>
    );
}
