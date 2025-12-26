import React from 'react';

export default function FilterBarShiftDetail() {
    return (
        <>
            <div className="filter-bar">
                <div className="search-box">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm chuyên gia theo tên, mã số..."
                    />
                </div>
                <div className="filter-actions">
                    <button className="btn btn-export btn-primary">
                        <i className="bi bi-download me-2"></i>
                        Xuất danh sách
                    </button>
                </div>
            </div>
        </>
    );
}
