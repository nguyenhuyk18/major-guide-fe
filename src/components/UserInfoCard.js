// import React from 'react';

export default function UserInfoCard(props) {
    const { userInfo, statusRegister, handleApproveRegister, handleCancleRegister, idRegister, registerInfo } = props
    return (
        <>
            <div className="expert-info-card mb-4">
                <div className="expert-profile">
                    <div className="expert-avatar-wrapper">
                        <img src={`${userInfo.fileAvartarUrl}`} alt={`${userInfo.name}`} className="expert-avatar-large" />
                        <span className="online-status"></span>
                    </div>
                    <div className="expert-details">
                        <h2 className="expert-name-large">{userInfo.name}</h2>
                        <div className="expert-meta">
                            {/* <div className="meta-item">
                                <i className="bi bi-briefcase"></i>
                                <span>Chuyên gia tâm lý</span>
                            </div> */}
                            <div className="meta-item">
                                <i className="bi bi-envelope"></i>
                                <span>{userInfo.email}</span>
                            </div>
                        </div>
                        <div className="expert-status-row">{
                            statusRegister === "approve" ? <span className="status-badge status-approved">
                                <i className="bi bi-dot"></i>
                                Đã Duyệt
                            </span> : statusRegister === "unreviewed" ? <span className="status-badge status-pending ">
                                <i className="bi bi-dot"></i>
                                Chưa Duyệt
                            </span> : statusRegister === "cancle" ? <span className="status-badge status-cancelled ">
                                <i className="bi bi-dot"></i>
                                Hủy
                            </span> : ''}

                            {/* <span className="register-time">• Đăng ký lúc: 15/10/2023 14:30</span> */}
                            {
                                registerInfo.available_date ? <span className="register-time" style={{ marginRight: '-5px' }} >• Lịch áp dụng vào: {new Date(registerInfo.available_date).toLocaleDateString('vi')}</span> : ''
                            }
                            {
                                registerInfo.unavailable_date ? <span className="register-time" >- {new Date(registerInfo.unavailable_date).toLocaleDateString('vi')}</span> : ''
                            }
                        </div>

                    </div>
                </div>

                {
                    statusRegister === "unreviewed" ?
                        <div className="action-buttons">
                            <button className="btn btn-danger" onClick={() => handleCancleRegister(idRegister)}>
                                <i className="bi bi-x-lg me-2"></i>
                                Từ chối
                            </button>
                            <button className="btn btn-approve" onClick={() => handleApproveRegister(idRegister)}>
                                <i className="bi bi-check-lg me-2"></i>
                                Duyệt lịch
                            </button>
                        </div> : ''
                }

            </div>
        </>
    );
}
