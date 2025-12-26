import React from 'react';
import { convertVietnamese } from '../helpers/help';

export default function ShiftDetailHeader(props) {
    const { shiftInfo } = props

    // console.log(shiftInfo)
    return (
        <>
            <div className="session-header">
                <div className="session-info">
                    <h1 className="session-title">{convertVietnamese(shiftInfo.day)} - {shiftInfo.shift_id.name_shift}</h1>
                    <div className="session-meta">
                        <div className="meta-item">
                            <i className="bi bi-clock"></i>
                            <span>{shiftInfo.shift_id.start_time} - {shiftInfo.shift_id.end_time}</span>
                        </div>
                        <div className="meta-item">
                            <i className="bi bi-calendar3"></i>
                            <span>{convertVietnamese(shiftInfo.day)},{" "}
                                {new Date().toLocaleDateString("vi-VN")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
