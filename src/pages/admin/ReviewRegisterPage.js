// import React from 'react';
import '../../assets/css/ReviewRegisterPage.css'

export default function ReviewRegisterPage() {
    return (
        <>
            <div className="consultation-management">
                {/* Header Section */}
                <div className="page-header mb-4">
                    <div className="d-flex justify-content-between align-items-start">
                        <div>
                            <h1 className="page-title">Quản lý Đăng ký Buổi Tư vấn</h1>
                            <p className="page-subtitle">Xem xét và phê duyệt các buổi tư vấn từ chuyên gia mới gia nhập.</p>
                        </div>
                        <button className="btn btn-add-request">
                            <i className="bi bi-plus-lg me-2"></i>
                            Tạo yêu cầu mới
                        </button>
                    </div>
                </div>

                {/* Statistics Cards */}
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
                                        <span className="stat-change stat-change-up">
                                            <i className="bi bi-arrow-up"></i>5%
                                        </span>
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
                                        <span className="stat-change stat-change-up">
                                            <i className="bi bi-arrow-up"></i>12%
                                        </span>
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

                {/* Filter Tabs */}
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

                {/* Table Section */}
                <div className="table-container">
                    <div className="table-responsive">
                        <table className="consultation-table">
                            <thead>
                                <tr>
                                    <th>CHUYÊN GIA</th>
                                    <th>CHỦ ĐỀ TƯ VẤN</th>
                                    <th>THỜI GIAN</th>
                                    <th>TRẠNG THÁI</th>
                                    <th>HÀNH ĐỘNG</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Row 1 */}
                                <tr>
                                    <td>
                                        <div className="expert-cell">
                                            <img src="https://i.pravatar.cc/150?img=12" alt="Nguyễn Văn A" className="expert-avatar" />
                                            <div className="expert-info">
                                                <div className="expert-name">Nguyễn Văn A</div>
                                                <div className="expert-role">Digital Marketing Expert</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="topic-cell">
                                            <div className="topic-title">Chiến lược Marketin...</div>
                                            <div className="topic-subtitle">Tư vấn 1:1</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="time-cell">
                                            <i className="bi bi-calendar3 me-2"></i>
                                            <div>
                                                <div className="time-date">12/10/2023, 10:00 AM</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge status-pending">
                                            <i className="bi bi-dot"></i>
                                            Chờ duyệt
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-action" title="Xem chi tiết">
                                            <i className="bi bi-eye"></i>
                                        </button>
                                    </td>
                                </tr>

                                {/* Row 2 */}
                                <tr>
                                    <td>
                                        <div className="expert-cell">
                                            <img src="https://i.pravatar.cc/150?img=5" alt="Trần Thị B" className="expert-avatar" />
                                            <div className="expert-info">
                                                <div className="expert-name">Trần Thị B</div>
                                                <div className="expert-role">Financial Advisor</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="topic-cell">
                                            <div className="topic-title">Tài chính cá nhân ch...</div>
                                            <div className="topic-subtitle">Workshop Group</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="time-cell">
                                            <i className="bi bi-calendar3 me-2"></i>
                                            <div>
                                                <div className="time-date">13/10/2023, 14:00 PM</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge status-approved">
                                            <i className="bi bi-dot"></i>
                                            Đã chấp nhận
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-action" title="Xem chi tiết">
                                            <i className="bi bi-eye"></i>
                                        </button>
                                    </td>
                                </tr>

                                {/* Row 3 */}
                                <tr>
                                    <td>
                                        <div className="expert-cell">
                                            <img src="https://i.pravatar.cc/150?img=33" alt="Lê Văn C" className="expert-avatar" />
                                            <div className="expert-info">
                                                <div className="expert-name">Lê Văn C</div>
                                                <div className="expert-role">Startup Founder</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="topic-cell">
                                            <div className="topic-title">Khởi nghiệp & Gọi vốn</div>
                                            <div className="topic-subtitle">Tư vấn 1:1</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="time-cell">
                                            <i className="bi bi-calendar3 me-2"></i>
                                            <div>
                                                <div className="time-date">14/10/2023, 09:00 AM</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge status-pending">
                                            <i className="bi bi-dot"></i>
                                            Chờ duyệt
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-action" title="Xem chi tiết">
                                            <i className="bi bi-eye"></i>
                                        </button>
                                    </td>
                                </tr>

                                {/* Row 4 */}
                                <tr>
                                    <td>
                                        <div className="expert-cell">
                                            <img src="https://i.pravatar.cc/150?img=20" alt="Phạm Thị D" className="expert-avatar" />
                                            <div className="expert-info">
                                                <div className="expert-name">Phạm Thị D</div>
                                                <div className="expert-role">HR Manager</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="topic-cell">
                                            <div className="topic-title">Kỹ năng Lãnh đạo Đ...</div>
                                            <div className="topic-subtitle">Training</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="time-cell">
                                            <i className="bi bi-calendar3 me-2"></i>
                                            <div>
                                                <div className="time-date">15/10/2023, 16:00 PM</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge status-cancelled">
                                            <i className="bi bi-dot"></i>
                                            Đã hủy
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-action" title="Xem chi tiết">
                                            <i className="bi bi-eye"></i>
                                        </button>
                                    </td>
                                </tr>

                                {/* Row 5 */}
                                <tr>
                                    <td>
                                        <div className="expert-cell">
                                            <img src="https://i.pravatar.cc/150?img=8" alt="Hoàng Văn E" className="expert-avatar" />
                                            <div className="expert-info">
                                                <div className="expert-name">Hoàng Văn E</div>
                                                <div className="expert-role">AI Engineer</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="topic-cell">
                                            <div className="topic-title">AI trong Business...</div>
                                            <div className="topic-subtitle">Webinar</div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="time-cell">
                                            <i className="bi bi-calendar3 me-2"></i>
                                            <div>
                                                <div className="time-date">16/10/2023, 10:00 AM</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="status-badge status-pending">
                                            <i className="bi bi-dot"></i>
                                            Chờ duyệt
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-action" title="Xem chi tiết">
                                            <i className="bi bi-eye"></i>
                                        </button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="table-footer">
                        <div className="pagination-info">
                            Hiển thị <strong>1</strong> đến <strong>5</strong> của <strong>124</strong> kết quả
                        </div>
                        <div className="pagination-controls">
                            <button className="btn-pagination" disabled>Trước</button>
                            <button className="btn-pagination">Sau</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
