import React from 'react';
import { Link } from 'react-router-dom';

const LEVEL_LABELS = { bachelor: 'Cử nhân', master: 'Thạc sĩ', doctor: 'Tiến sĩ', phd: 'Tiến sĩ', professor: 'Giáo sư' };

const LEVEL_COLORS = {
    'Cử nhân':    { bg: '#dbeafe',   text: '#1d4ed8' },
    'Thạc sĩ':    { bg: '#ede9fe',   text: '#7c3aed' },
    'Tiến sĩ':    { bg: '#fef9c3',   text: '#854d0e' },
    'Giáo sư':    { bg: '#d1fae5',   text: '#065f46' },
    'Không rõ':   { bg: '#f3f4f6',   text: '#6b7280' },
};

const STATUS_COLORS = {
    'active': '#10b981',
    'busy':   '#f59e0b',
    'down':   '#ef4444',
};

const formatPrice = (price) => {
    if (!price && price !== 0) return 'Liên hệ';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(price);
};

const ExpertCardChat = ({ expert }) => {
    const level = LEVEL_LABELS[String(expert.level || '').toLowerCase()] || expert.level || 'Không rõ';
    const levelStyle = LEVEL_COLORS[level] || LEVEL_COLORS['Không rõ'];
    const statusColor = STATUS_COLORS[expert.status] || STATUS_COLORS['active'];

    return (
        <div className="expert-card-chat">
            {/* Avatar + Basic Info */}
            <div className="ecc-top">
                <div className="ecc-avatar-wrap">
                    <img
                        src={expert.avatar || 'https://res.cloudinary.com/dszzlhs5i/image/upload/v1765722730/avatar-mac-dinh-4-2_x3xl1f.jpg'}
                        alt={expert.name}
                        className="ecc-avatar"
                        onError={(e) => {
                            e.target.src = 'https://res.cloudinary.com/dszzlhs5i/image/upload/v1765722730/avatar-mac-dinh-4-2_x3xl1f.jpg';
                        }}
                    />
                    <span className="ecc-status-dot" style={{ background: statusColor }} />
                </div>

                <div className="ecc-info">
                    <div className="ecc-name">{expert.name}</div>
                    <div className="ecc-major">{expert.major}</div>
                    <span
                        className="ecc-level-badge"
                        style={{ background: levelStyle.bg, color: levelStyle.text }}
                    >
                        {level}
                    </span>
                </div>
            </div>

            {/* Teach at */}
            {expert.teachAt && expert.teachAt !== 'Không rõ' && (
                <div className="ecc-row">
                    <i className="bi bi-geo-alt-fill ecc-icon" />
                    <span>{expert.teachAt}</span>
                </div>
            )}

            {/* Information */}
            {expert.matchReason && (
                <div className="ecc-row ecc-reason">
                    <i className="bi bi-stars ecc-icon" />
                    <span>{expert.matchReason}</span>
                </div>
            )}

            {(expert.information || expert.about) && (
                <div className="ecc-bio">{expert.information || expert.about}</div>
            )}

            {/* Price */}
            <div className="ecc-price-row">
                <span className="ecc-price">{formatPrice(expert.price)}</span>
                <Link to={`/experts/${encodeURIComponent(expert.id)}`} className="ecc-btn-profile">
                    Hồ sơ
                </Link>
                <Link to={`/choose-schedule?expert_id=${encodeURIComponent(expert.id)}`} className="ecc-btn-book">
                    Đặt tư vấn
                </Link>
            </div>
        </div>
    );
};

export default ExpertCardChat;
