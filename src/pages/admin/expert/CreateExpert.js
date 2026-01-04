import React from 'react';

export default function CreateExpert() {
    return (
        <>
            <div className="create-expert">
                {/* Page Header */}
                <div className="page-header">
                    <div className="header-left">
                        <button className="btn-back">
                            <i className="bi bi-arrow-left me-2"></i>
                            Quay lại
                        </button>
                        <div className="header-title-group">
                            <h1 className="page-title">Thêm chuyên gia mới</h1>
                            <p className="page-subtitle">Điền thông tin chi tiết để thêm chuyên gia vào hệ thống</p>
                        </div>
                    </div>
                </div>

                <div className="form-container">
                    <form className="expert-form">
                        {/* Personal Information Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <i className="bi bi-person-circle section-icon"></i>
                                <h2 className="section-title">Thông tin cá nhân</h2>
                            </div>

                            <div className="row g-3">
                                {/* Avatar Upload */}
                                <div className="col-12">
                                    <div className="avatar-upload-wrapper">
                                        <div className="avatar-preview">
                                            <img src="https://via.placeholder.com/120" alt="Avatar" className="avatar-img" />
                                            <div className="avatar-overlay">
                                                <i className="bi bi-camera"></i>
                                            </div>
                                        </div>
                                        <div className="avatar-info">
                                            <h4 className="avatar-title">Ảnh đại diện</h4>
                                            <p className="avatar-desc">Tải lên ảnh chân dung rõ nét, tối đa 2MB</p>
                                            <button type="button" className="btn-upload">
                                                <i className="bi bi-upload me-2"></i>
                                                Tải ảnh lên
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Full Name */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Họ và tên <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nhập họ và tên đầy đủ"
                                    />
                                </div>

                                {/* Email */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Email <span className="required">*</span>
                                    </label>
                                    <input
                                        type="email"
                                        className="form-control"
                                        placeholder="example@email.com"
                                    />
                                </div>

                                {/* Phone */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Số điện thoại <span className="required">*</span>
                                    </label>
                                    <input
                                        type="tel"
                                        className="form-control"
                                        placeholder="0123 456 789"
                                    />
                                </div>

                                {/* Date of Birth */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Ngày sinh
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                    />
                                </div>

                                {/* Gender */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Giới tính
                                    </label>
                                    <select className="form-control">
                                        <option value="">Chọn giới tính</option>
                                        <option value="male">Nam</option>
                                        <option value="female">Nữ</option>
                                        <option value="other">Khác</option>
                                    </select>
                                </div>

                                {/* Address */}
                                <div className="col-12">
                                    <label className="form-label">
                                        Địa chỉ
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Nhập địa chỉ đầy đủ"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Professional Information Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <i className="bi bi-briefcase section-icon"></i>
                                <h2 className="section-title">Thông tin chuyên môn</h2>
                            </div>

                            <div className="row g-3">
                                {/* Specialization */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Lĩnh vực chuyên môn <span className="required">*</span>
                                    </label>
                                    <select className="form-control">
                                        <option value="">Chọn lĩnh vực</option>
                                        <option value="psychology">Tâm lý học</option>
                                        <option value="finance">Tài chính</option>
                                        <option value="law">Pháp luật</option>
                                        <option value="business">Kinh doanh</option>
                                        <option value="health">Sức khỏe</option>
                                        <option value="education">Giáo dục</option>
                                    </select>
                                </div>

                                {/* Years of Experience */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Số năm kinh nghiệm <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="Nhập số năm"
                                        min="0"
                                    />
                                </div>

                                {/* Degree */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Trình độ học vấn
                                    </label>
                                    <select className="form-control">
                                        <option value="">Chọn trình độ</option>
                                        <option value="bachelor">Cử nhân</option>
                                        <option value="master">Thạc sĩ</option>
                                        <option value="doctor">Tiến sĩ</option>
                                        <option value="professor">Giáo sư</option>
                                    </select>
                                </div>

                                {/* Certification */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Chứng chỉ hành nghề
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Mã số chứng chỉ"
                                    />
                                </div>

                                {/* Consultation Fee */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Phí tư vấn (VNĐ/giờ) <span className="required">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        className="form-control"
                                        placeholder="500000"
                                        min="0"
                                    />
                                </div>

                                {/* Bio */}
                                <div className="col-12">
                                    <label className="form-label">
                                        Giới thiệu bản thân
                                    </label>
                                    <textarea
                                        className="form-control"
                                        rows="4"
                                        placeholder="Viết một đoạn giới thiệu ngắn về bản thân và kinh nghiệm làm việc..."
                                    ></textarea>
                                </div>

                                {/* Skills/Tags */}
                                <div className="col-12">
                                    <label className="form-label">
                                        Kỹ năng chuyên môn
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="VD: Tâm lý trẻ em, Tư vấn gia đình, Trị liệu hành vi..."
                                    />
                                    <small className="form-text">Nhập các kỹ năng cách nhau bởi dấu phẩy</small>
                                </div>
                            </div>
                        </div>

                        {/* Account Information Section */}
                        <div className="form-section">
                            <div className="section-header">
                                <i className="bi bi-shield-lock section-icon"></i>
                                <h2 className="section-title">Thông tin tài khoản</h2>
                            </div>

                            <div className="row g-3">
                                {/* Username */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Tên đăng nhập <span className="required">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        placeholder="Tên đăng nhập duy nhất"
                                    />
                                </div>

                                {/* Password */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Mật khẩu <span className="required">*</span>
                                    </label>
                                    <input
                                        type="password"
                                        className="form-control"
                                        placeholder="Nhập mật khẩu"
                                    />
                                </div>

                                {/* Status */}
                                <div className="col-md-6">
                                    <label className="form-label">
                                        Trạng thái hoạt động
                                    </label>
                                    <select className="form-control">
                                        <option value="active">Sẵn sàng</option>
                                        <option value="busy">Đang bận</option>
                                        <option value="inactive">Ngừng hoạt động</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="form-actions">
                            <button type="button" className="btn-cancel">
                                Hủy bỏ
                            </button>
                            <button type="submit" className="btn-submit">
                                <i className="bi bi-check-lg me-2"></i>
                                Tạo chuyên gia
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
