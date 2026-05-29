import React from 'react';

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
    const levelStyle = LEVEL_COLORS[expert.level] || LEVEL_COLORS['Không rõ'];
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
                        {expert.level}
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
            {expert.information && (
                <div className="ecc-bio">{expert.information}</div>
            )}

            {/* Price */}
            <div className="ecc-price-row">
                <span className="ecc-price">{formatPrice(expert.price)}</span>
                <a
                    href={`/expert/${expert.id}`}
                    className="ecc-btn-book"
                    onClick={(e) => e.preventDefault()}
                >
                    Đặt tư vấn
                </a>
            </div>
        </div>
    );
};

export default ExpertCardChat;
