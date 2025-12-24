// import React, { useState } from 'react';
import '../../assets/css/ShiftDetailAdmin.css'

export default function ShiftDetailPage() {


    return (
        <>
            <div className="consultation-detail">
                {/* Breadcrumb */}
                <nav className="breadcrumb-nav mb-4">
                    <a href="/" className="breadcrumb-item">Dashboard</a>
                    <i className="bi bi-chevron-right"></i>
                    <a href="/" className="breadcrumb-item">Quản lý lịch</a>
                    <i className="bi bi-chevron-right"></i>
                    <span className="breadcrumb-item active">Chi tiết ca tư vấn</span>
                </nav>

                {/* Session Header */}
                <div className="session-header">
                    <div className="session-info">
                        <h1 className="session-title">Thứ 2 - Buổi Sáng - Ca 1</h1>
                        <div className="session-meta">
                            <div className="meta-item">
                                <i className="bi bi-clock"></i>
                                <span>08:00 - 10:00</span>
                            </div>
                            <div className="meta-item">
                                <i className="bi bi-calendar3"></i>
                                <span>Thứ Hai, 23/10/2023</span>
                            </div>
                            <span className="status-badge status-open">
                                <i className="bi bi-circle-fill"></i>
                                Đang mở
                            </span>
                        </div>
                    </div>
                    <button className="btn btn-edit-session">
                        <i className="bi bi-pencil me-2"></i>
                        Chỉnh sửa ca
                    </button>
                </div>

                {/* Statistics Cards */}
                <div className="row g-3 mb-4">
                    <div className="col-md-4">
                        <div className="stat-card stat-total">
                            <div className="stat-icon">
                                <i className="bi bi-calendar-check"></i>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Tổng số ghế</div>
                                <div className="stat-value">20</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="stat-card stat-registered">
                            <div className="stat-icon">
                                <i className="bi bi-person-check"></i>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Đã đăng ký</div>
                                <div className="stat-value">15</div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="stat-card stat-available">
                            <div className="stat-icon">
                                <i className="bi bi-inbox"></i>
                            </div>
                            <div className="stat-content">
                                <div className="stat-label">Còn trống</div>
                                <div className="stat-value">5</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filter and Actions Bar */}
                <div className="filter-bar">
                    <div className="search-box">
                        <i className="bi bi-search"></i>
                        <input
                            type="text"
                            placeholder="Tìm kiếm chuyên gia theo tên, mã số..."
                        />
                    </div>
                    <div className="filter-actions">
                        <button className="btn btn-filter">
                            <i className="bi bi-funnel me-2"></i>
                            Lọc chuyên môn
                        </button>
                        <button className="btn btn-sort">
                            <i className="bi bi-sort-down me-2"></i>
                            Sắp xếp
                        </button>
                        <button className="btn btn-export btn-primary">
                            <i className="bi bi-download me-2"></i>
                            Xuất danh sách
                        </button>
                    </div>
                </div>

                {/* Experts Grid */}
                <div className="experts-grid">
                    {/* Expert Card 1 - Nguyễn Văn An */}
                    <div className="expert-card">
                        <div className="expert-header">
                            <div className="expert-avatar-wrapper">
                                <img src="https://i.pravatar.cc/150?img=12" alt="Nguyễn Văn An" className="expert-avatar" />
                                <div className="verified-badge">
                                    <i className="bi bi-check-lg"></i>
                                </div>
                                <div className="online-indicator"></div>
                            </div>

                            <div className="expert-info">
                                <div className="d-flex align-items-center gap-2">
                                    <h3 className="expert-name">Nguyễn Văn An</h3>
                                    <button className="btn-user-profile" title="Xem hồ sơ">
                                        <i className="bi bi-person"></i>
                                    </button>
                                </div>
                                <p className="expert-specialization">Chuyên gia Tài chính</p>
                                <div className="expert-rating">
                                    <i className="bi bi-star-fill"></i>
                                    <span className="rating-value">4.9</span>
                                    <span className="rating-count">(120 đánh giá)</span>
                                </div>
                            </div>
                        </div>

                        <div className="expert-tags">
                            <span className="tag">Tài chính doanh nghiệp</span>
                            <span className="tag">Kế toán</span>
                        </div>

                        <div className="expert-actions">
                            <button className="btn btn-view-profile">
                                Xem hồ sơ
                            </button>
                            <button className="btn-message" title="Nhắn tin">
                                <i className="bi bi-chat-dots"></i>
                            </button>
                        </div>
                    </div>

                    {/* Expert Card 2 - Trần Thị Bình */}
                    <div className="expert-card">
                        <div className="expert-header">
                            <div className="expert-avatar-wrapper">
                                <img src="https://i.pravatar.cc/150?img=5" alt="Trần Thị Bình" className="expert-avatar" />
                                <div className="verified-badge">
                                    <i className="bi bi-check-lg"></i>
                                </div>
                                <div className="online-indicator"></div>
                            </div>

                            <div className="expert-info">
                                <div className="d-flex align-items-center gap-2">
                                    <h3 className="expert-name">Trần Thị Bình</h3>
                                    <button className="btn-user-profile" title="Xem hồ sơ">
                                        <i className="bi bi-person"></i>
                                    </button>
                                </div>
                                <p className="expert-specialization">Chuyên gia Pháp luật</p>
                                <div className="expert-rating">
                                    <i className="bi bi-star-fill"></i>
                                    <span className="rating-value">5.0</span>
                                    <span className="rating-count">(45 đánh giá)</span>
                                </div>
                            </div>
                        </div>

                        <div className="expert-tags">
                            <span className="tag">Luật dân sự</span>
                            <span className="tag">Tư vấn hợp đồng</span>
                        </div>

                        <div className="expert-actions">
                            <button className="btn btn-view-profile">
                                Xem hồ sơ
                            </button>
                            <button className="btn-message" title="Nhắn tin">
                                <i className="bi bi-chat-dots"></i>
                            </button>
                        </div>
                    </div>

                    {/* Expert Card 3 - Lê Văn Cường */}
                    <div className="expert-card">
                        <div className="expert-header">
                            <div className="expert-avatar-wrapper">
                                <img src="https://i.pravatar.cc/150?img=33" alt="Lê Văn Cường" className="expert-avatar" />
                                <div className="verified-badge">
                                    <i className="bi bi-check-lg"></i>
                                </div>
                                <div className="online-indicator"></div>
                            </div>

                            <div className="expert-info">
                                <div className="d-flex align-items-center gap-2">
                                    <h3 className="expert-name">Lê Văn Cường</h3>
                                    <button className="btn-user-profile" title="Xem hồ sơ">
                                        <i className="bi bi-person"></i>
                                    </button>
                                </div>
                                <p className="expert-specialization">Chuyên gia Tâm lý</p>
                                <div className="expert-rating">
                                    <i className="bi bi-star-fill"></i>
                                    <span className="rating-value">4.8</span>
                                    <span className="rating-count">(88 đánh giá)</span>
                                </div>
                            </div>
                        </div>

                        <div className="expert-tags">
                            <span className="tag">Trị liệu tâm lý</span>
                            <span className="tag">Tư vấn hôn nhân</span>
                        </div>

                        <div className="expert-actions">
                            <button className="btn btn-view-profile">
                                Xem hồ sơ
                            </button>
                            <button className="btn-message" title="Nhắn tin">
                                <i className="bi bi-chat-dots"></i>
                            </button>
                        </div>
                    </div>

                    {/* Expert Card 4 - Phạm Minh Đức */}
                    <div className="expert-card">
                        <div className="expert-header">
                            <div className="expert-avatar-wrapper">
                                <img src="https://i.pravatar.cc/150?img=15" alt="Phạm Minh Đức" className="expert-avatar" />
                                <div className="verified-badge">
                                    <i className="bi bi-check-lg"></i>
                                </div>
                            </div>

                            <div className="expert-info">
                                <div className="d-flex align-items-center gap-2">
                                    <h3 className="expert-name">Phạm Minh Đức</h3>
                                    <button className="btn-user-profile" title="Xem hồ sơ">
                                        <i className="bi bi-person"></i>
                                    </button>
                                </div>
                                <p className="expert-specialization">Tư Vấn Khởi nghiệp</p>
                                <div className="expert-rating">
                                    <i className="bi bi-star-fill"></i>
                                    <span className="rating-value">4.6</span>
                                    <span className="rating-count">(32 đánh giá)</span>
                                </div>
                            </div>
                        </div>

                        <div className="expert-tags">
                            <span className="tag">Gọi vốn</span>
                            <span className="tag">Mô hình kinh doanh</span>
                        </div>

                        <div className="expert-actions">
                            <button className="btn btn-view-profile">
                                Xem hồ sơ
                            </button>
                            <button className="btn-message" title="Nhắn tin">
                                <i className="bi bi-chat-dots"></i>
                            </button>
                        </div>
                    </div>

                    {/* Expert Card 5 - Hoàng Thị Em */}
                    <div className="expert-card">
                        <div className="expert-header">
                            <div className="expert-avatar-wrapper">
                                <img src="https://i.pravatar.cc/150?img=9" alt="Hoàng Thị Em" className="expert-avatar" />
                                <div className="verified-badge">
                                    <i className="bi bi-check-lg"></i>
                                </div>
                                <div className="online-indicator"></div>
                            </div>

                            <div className="expert-info">
                                <div className="d-flex align-items-center gap-2">
                                    <h3 className="expert-name">Hoàng Thị Em</h3>
                                    <button className="btn-user-profile" title="Xem hồ sơ">
                                        <i className="bi bi-person"></i>
                                    </button>
                                </div>
                                <p className="expert-specialization">Chuyên gia Nhân sự</p>
                                <div className="expert-rating">
                                    <i className="bi bi-star-fill"></i>
                                    <span className="rating-value">5.0</span>
                                    <span className="rating-count">(15 đánh giá)</span>
                                </div>
                            </div>
                        </div>

                        <div className="expert-tags">
                            <span className="tag">Tuyển dụng</span>
                            <span className="tag">Đào tạo</span>
                        </div>

                        <div className="expert-actions">
                            <button className="btn btn-view-profile">
                                Xem hồ sơ
                            </button>
                            <button className="btn-message" title="Nhắn tin">
                                <i className="bi bi-chat-dots"></i>
                            </button>
                        </div>
                    </div>

                    {/* Add New Expert Card */}
                    <div className="expert-card add-expert-card">
                        <div className="add-expert-content">
                            <div className="add-icon">
                                <i className="bi bi-plus-lg"></i>
                            </div>
                            <p className="add-text">Thêm chuyên gia thủ công</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
