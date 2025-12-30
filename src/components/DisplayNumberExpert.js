import React from 'react';
import { Link } from 'react-router-dom';

export default function DisplayNumberExpert(props) {

    const { numberOfExpert, shiftInDayId, dayCurrent } = props



    return (
        <>
            <div className="schedule-cell has-appointments">
                <div className="cell-content">
                    <div className="appointment-count">{numberOfExpert}</div>
                    <div className="appointment-label">chuyên gia</div>
                    <Link to={`/admin/shift-detail/${shiftInDayId}/${dayCurrent.getFullYear()}_${dayCurrent.getMonth() + 1}_${dayCurrent.getDate()}`} className="btn btn-detail btn-sm mt-2">
                        Xem chi tiết
                    </Link>
                </div>
            </div>
        </>
    );
}
