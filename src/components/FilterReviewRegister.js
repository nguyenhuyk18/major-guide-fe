import React from 'react';

export default function FilterReviewRegister(props) {

    const { handleFindByStatus, status } = props;

    return (
        <>
            <div className="filter-tabs mb-4">
                <button className={`filter-tab ${status === '' ? 'active' : ''}`} onClick={() => handleFindByStatus('')}>
                    <i className="bi bi-list-ul me-2"></i>
                    Tất cả
                </button>
                <button className={`filter-tab ${status === 'unreviewed' ? 'active' : ''}`} onClick={() => handleFindByStatus('unreviewed')}>
                    <i className="bi bi-clock me-2"></i>
                    Chờ duyệt
                </button>
                <button className={`filter-tab ${status === 'approve' ? 'active' : ''}`} onClick={() => handleFindByStatus('approve')}>
                    <i className="bi bi-check-circle me-2"></i>
                    Đã chấp nhận
                </button>
                <button className={`filter-tab ${status === 'cancle' ? 'active' : ''}`} onClick={() => handleFindByStatus('cancle')} >
                    <i className="bi bi-x-circle me-2"></i>
                    Đã hủy
                </button>
            </div>
        </>
    );
}
