import React from 'react';

export default function RegisterReviewCard() {
    return (
        <>
            <div className="row g-3 mb-4">
                <div className="col-xl-3 col-md-6">
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon stat-icon-total">
                                <i className="bi bi-folder"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Tổng yêu cầu</div>
                                <div className="stat-value-group">
                                    <span className="stat-value">124</span>
                                    {/* <span className="stat-change stat-change-up">
                                            <i className="bi bi-arrow-up"></i>5%
                                        </span> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon stat-icon-pending">
                                <i className="bi bi-clock-history"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Chờ duyệt</div>
                                <div className="stat-value-group">
                                    <span className="stat-value">45</span>
                                    {/* <span className="stat-change stat-change-up">
                                            <i className="bi bi-arrow-up"></i>12%
                                        </span> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon stat-icon-approved">
                                <i className="bi bi-check-circle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Đã duyệt</div>
                                <div className="stat-value-group">
                                    <span className="stat-value">12</span>
                                    {/* <span className="stat-change stat-change-up">
                                            <i className="bi bi-arrow-up"></i>2%
                                        </span> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-xl-3 col-md-6">
                    <div className="stat-card">
                        <div className="stat-header">
                            <div className="stat-icon stat-icon-cancelled">
                                <i className="bi bi-x-circle"></i>
                            </div>
                            <div className="stat-info">
                                <div className="stat-label">Đã hủy</div>
                                <div className="stat-value-group">
                                    <span className="stat-value">3</span>
                                    {/* <span className="stat-change stat-change-neutral">0%</span> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
