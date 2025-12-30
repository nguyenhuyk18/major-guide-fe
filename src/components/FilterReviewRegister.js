import React from 'react';

export default function FilterReviewRegister() {
    return (
        <>
            <div className="filter-tabs mb-4">
                <button className="filter-tab ">
                    <i className="bi bi-list-ul me-2"></i>
                    Tất cả
                </button>
                <button className="filter-tab active">
                    <i className="bi bi-clock me-2"></i>
                    Chờ duyệt
                </button>
                <button className="filter-tab">
                    <i className="bi bi-check-circle me-2"></i>
                    Đã chấp nhận
                </button>
                <button className="filter-tab">
                    <i className="bi bi-x-circle me-2"></i>
                    Đã hủy
                </button>
            </div>
        </>
    );
}
