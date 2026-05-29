import './QuizResultModal.css';

const TRAIT_LABELS = {
    logical: 'Tư duy logic',
    analytical: 'Phân tích',
    discipline: 'Kỷ luật',
    technical: 'Kỹ thuật',
    curiosity: 'Tò mò',
    creative: 'Sáng tạo',
    systematic: 'Hệ thống',
    research_mindset: 'Nghiên cứu',
    detail_oriented: 'Chú ý chi tiết',
    artistic: 'Nghệ thuật',
    adaptability: 'Thích nghi',
    communication: 'Giao tiếp',
    leadership: 'Lãnh đạo',
    persuasion: 'Thuyết phục',
    empathy: 'Đồng cảm'
};

const TRAIT_ICONS = {
    logical: 'bi-lightning-charge',
    analytical: 'bi-graph-up',
    discipline: 'bi-calendar-check',
    technical: 'bi-gear',
    curiosity: 'bi-search',
    creative: 'bi-palette',
    systematic: 'bi-diagram-3',
    research_mindset: 'bi-journal-bookmark',
    detail_oriented: 'bi-bullseye',
    artistic: 'bi-palette2',
    adaptability: 'bi-arrow-repeat',
    communication: 'bi-people',
    leadership: 'bi-person-check',
    persuasion: 'bi-megaphone',
    empathy: 'bi-heart'
};

const TRAIT_COLORS = {
    logical: '#6366f1',
    analytical: '#8b5cf6',
    discipline: '#10b981',
    technical: '#3b82f6',
    curiosity: '#f59e0b',
    creative: '#ec4899',
    systematic: '#14b8a6',
    research_mindset: '#a855f7',
    detail_oriented: '#f97316',
    artistic: '#eab308',
    adaptability: '#06b6d4',
    communication: '#22c55e',
    leadership: '#3b82f6',
    persuasion: '#ef4444',
    empathy: '#f472b6'
};

export default function QuizResultModal({ show, onClose, result, careerPrediction }) {
    if (!show || !result) return null;

    const sortedTraits = [...(result.traitScores || [])].sort((a, b) => b.score - a.score);
    const topTraits = sortedTraits.slice(0, 5);

    const getTraitBarWidth = (score, maxScore) => {
        return Math.min((score / maxScore) * 100, 100);
    };

    const maxScore = topTraits.length > 0 ? topTraits[0].score : 1;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="result-modal-content" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="result-modal-header">
                    <div className="result-success-icon">
                        <i className="bi bi-check-circle-fill"></i>
                    </div>
                    <h2>Hoàn thành bài đánh giá!</h2>
                    <p className="result-test-id">
                        Mã bài test: <strong>{result.testId}</strong>
                    </p>
                    <p className="result-completed-at">
                        {formatDate(result.completedAt)}
                    </p>
                </div>

                {/* Career Prediction Section */}
                {careerPrediction && (
                    <div className="result-career-prediction">
                        <h3>
                            <i className="bi bi-mortarboard-fill"></i>
                            Nhóm ngành phù hợp với bạn
                        </h3>
                        
                        {/* Primary Prediction */}
                        <div className="career-primary">
                            <div className="career-primary-badge">
                                <i className="bi bi-star-fill"></i>
                                Đề xuất chính
                            </div>
                            <div className="career-primary-content">
                                <h4>{careerPrediction.primary.display_name}</h4>
                                <div className="career-confidence">
                                    <div className="confidence-bar-bg">
                                        <div 
                                            className="confidence-bar-fill"
                                            style={{ width: `${careerPrediction.primary.confidence * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="confidence-text">
                                        Độ chính xác: {(careerPrediction.primary.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Top 3 Predictions */}
                        <div className="career-top3">
                            <h5>Các ngành gợi ý khác</h5>
                            <div className="career-top3-list">
                                {careerPrediction.top_3.slice(1).map((item, index) => (
                                    <div key={item.label} className="career-top3-item">
                                        <span className="career-rank">#{index + 2}</span>
                                        <span className="career-name">{item.display_name}</span>
                                        <span className="career-prob">{(item.confidence * 100).toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Summary Stats */}
                <div className="result-summary">
                    <div className="summary-stat">
                        <div className="stat-icon">
                            <i className="bi bi-list-check"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{result.answers?.length || 0}</span>
                            <span className="stat-label">Câu hỏi</span>
                        </div>
                    </div>
                    <div className="summary-stat">
                        <div className="stat-icon total">
                            <i className="bi bi-calculator"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{result.totalScore}</span>
                            <span className="stat-label">Tổng điểm</span>
                        </div>
                    </div>
                    <div className="summary-stat">
                        <div className="stat-icon avg">
                            <i className="bi bi-graph-up"></i>
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">
                                {(result.totalScore / (result.answers?.length || 1)).toFixed(1)}
                            </span>
                            <span className="stat-label">Điểm TB</span>
                        </div>
                    </div>
                </div>

                {/* Top Traits */}
                <div className="result-traits">
                    <h3>
                        <i className="bi bi-stars"></i>
                        Top tính cách nổi bật của bạn
                    </h3>
                    
                    <div className="traits-list">
                        {topTraits.map((trait, index) => (
                            <div key={trait.trait} className="trait-item">
                                <div className="trait-rank">
                                    #{index + 1}
                                </div>
                                <div className="trait-icon" 
                                    style={{ backgroundColor: `${TRAIT_COLORS[trait.trait]}20`, color: TRAIT_COLORS[trait.trait] }}>
                                    <i className={`bi ${TRAIT_ICONS[trait.trait] || 'bi-person'}`}></i>
                                </div>
                                <div className="trait-info">
                                    <div className="trait-name-row">
                                        <span className="trait-name">
                                            {TRAIT_LABELS[trait.trait] || trait.trait}
                                        </span>
                                        <span className="trait-score">
                                            {trait.score} điểm
                                        </span>
                                    </div>
                                    <div className="trait-bar-bg">
                                        <div 
                                            className="trait-bar-fill"
                                            style={{ 
                                                width: `${getTraitBarWidth(trait.score, maxScore)}%`,
                                                backgroundColor: TRAIT_COLORS[trait.trait]
                                            }}
                                        ></div>
                                    </div>
                                    <span className="trait-count">
                                        Xuất hiện trong {trait.count} câu hỏi
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* All Traits */}
                {sortedTraits.length > 5 && (
                    <div className="all-traits">
                        <h4>Các tính cách khác</h4>
                        <div className="other-traits">
                            {sortedTraits.slice(5).map(trait => (
                                <span 
                                    key={trait.trait}
                                    className="other-trait-badge"
                                    style={{ borderColor: TRAIT_COLORS[trait.trait] }}
                                >
                                    <i className={`bi ${TRAIT_ICONS[trait.trait] || 'bi-circle'}`}></i>
                                    {TRAIT_LABELS[trait.trait] || trait.trait}: {trait.score}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="result-actions">
                    <button className="btn btn-primary btn-lg" onClick={onClose}>
                        <i className="bi bi-clock-history"></i>
                        Xem lịch sử làm bài
                    </button>
                </div>
            </div>
        </div>
    );
}
