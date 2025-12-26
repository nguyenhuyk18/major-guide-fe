// import React from 'react';

export default function ExpertListCard(props) {

    const { expertInfo } = props

    return (
        <>
            <div className="expert-card">
                <div className="expert-header">
                    <div className="expert-avatar-wrapper">
                        <img src={`${expertInfo.fileAvartarUrl}`} alt="Nguyễn Văn An" className="expert-avatar" />
                        <div className="verified-badge">
                            <i className="bi bi-check-lg"></i>
                        </div>
                        <div className="online-indicator"></div>
                    </div>

                    <div className="expert-info">
                        <div className="d-flex align-items-center gap-2">
                            <h3 className="expert-name">{expertInfo.name}</h3>

                        </div>
                        <p className="expert-specialization">Chuyên gia tư vấn</p>
                        <div className="expert-rating">
                            <i className="bi bi-star-fill"></i>
                            <span className="rating-value">4.9</span>
                            <span className="rating-count">(120 đánh giá)</span>
                        </div>
                    </div>
                </div>

                <div className="expert-actions">
                    <button className="btn btn-view-profile">
                        Xem hồ sơ
                    </button>
                </div>
            </div>
        </>
    );
}
