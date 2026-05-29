import './CareerAnalysisModal.css';

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

export default function CareerAnalysisModal({ show, onClose, result, careerAnalysis }) {
    if (!show || !result) return null;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const sortedTraits = [...(result.traitScores || [])]
        .sort((a, b) => b.score - a.score)
        .slice(0, 5);

    const maxTraitScore = sortedTraits.length > 0 ? sortedTraits[0].score : 1;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="career-analysis-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="career-analysis-header">
                    <button className="btn-close-modal" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                    <div className="career-header-icon">
                        <i className="bi bi-mortarboard-fill"></i>
                    </div>
                    <h2>Phân tích ngành học</h2>
                    <p className="career-test-info">
                        Bài test #{result.testId} • {formatDate(result.completedAt)}
                    </p>
                </div>

                {/* Loading State */}
                {!careerAnalysis && (
                    <div className="career-analysis-loading">
                        <div className="loading-dots">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                        <p>Đang phân tích...</p>
                    </div>
                )}

                {/* Results */}
                {careerAnalysis && (
                    <div className="career-analysis-content">
                        {/* Primary Recommendation */}
                        <div className="career-primary-card">
                            <div className="career-badge-primary">
                                <i className="bi bi-star-fill"></i>
                                Ngành phù hợp nhất
                            </div>
                            <h3 className="career-primary-name">
                                {careerAnalysis.primary.display_name}
                            </h3>
                            <div className="career-confidence-section">
                                <div className="confidence-label">
                                    <span>Độ phù hợp</span>
                                    <span className="confidence-value">
                                        {(careerAnalysis.primary.confidence * 100).toFixed(1)}%
                                    </span>
                                </div>
                                <div className="confidence-bar">
                                    <div 
                                        className="confidence-fill"
                                        style={{ width: `${careerAnalysis.primary.confidence * 100}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>

                        {/* All Recommendations */}
                        <div className="career-recommendations">
                            <h4>
                                <i className="bi bi-list-ol"></i>
                                Xếp hạng các ngành
                            </h4>
                            <div className="career-rankings">
                                {careerAnalysis.top_3.map((item, index) => (
                                    <div 
                                        key={item.label}
                                        className={`career-rank-item ${index === 0 ? 'top-1' : ''}`}
                                    >
                                        <div className="rank-position">
                                            {index === 0 ? (
                                                <i className="bi bi-trophy-fill"></i>
                                            ) : (
                                                <span>#{index + 1}</span>
                                            )}
                                        </div>
                                        <div className="rank-info">
                                            <span className="rank-name">{item.display_name}</span>
                                            <div className="rank-bar-bg">
                                                <div 
                                                    className="rank-bar-fill"
                                                    style={{ width: `${item.confidence * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="rank-percent">
                                            {(item.confidence * 100).toFixed(1)}%
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Top Traits */}
                        <div className="career-traits-section">
                            <h4>
                                <i className="bi bi-person-hearts"></i>
                                Tính cách nổi bật
                            </h4>
                            <div className="career-traits-grid">
                                {sortedTraits.map((trait, index) => (
                                    <div 
                                        key={trait.trait}
                                        className="career-trait-item"
                                        style={{ 
                                            '--trait-color': TRAIT_COLORS[trait.trait],
                                            '--trait-bg': `${TRAIT_COLORS[trait.trait]}15`
                                        }}
                                    >
                                        <div className="trait-icon-wrap">
                                            <i className={`bi ${TRAIT_ICONS[trait.trait] || 'bi-person'}`}></i>
                                        </div>
                                        <div className="trait-details">
                                            <span className="trait-name">
                                                {TRAIT_LABELS[trait.trait] || trait.trait}
                                            </span>
                                            <div className="trait-bar-mini">
                                                <div 
                                                    className="trait-bar-mini-fill"
                                                    style={{ 
                                                        width: `${(trait.score / maxTraitScore) * 100}%`,
                                                        backgroundColor: TRAIT_COLORS[trait.trait]
                                                    }}
                                                ></div>
                                            </div>
                                        </div>
                                        <span className="trait-score">{trait.score}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Insight */}
                        <div className="career-insight">
                            <div className="insight-icon">
                                <i className="bi bi-lightbulb-fill"></i>
                            </div>
                            <div className="insight-content">
                                <h5>Gợi ý</h5>
                                <p>
                                    Dựa trên kết quả bài test, bạn có những đặc điểm tính cách phù hợp với 
                                    ngành <strong>{careerAnalysis.primary.display_name}</strong>. 
                                    Hãy khám phá thêm về chương trình đào tạo và cơ hội nghề nghiệp trong lĩnh vực này.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Actions */}
                <div className="career-analysis-actions">
                    <button className="btn-cancel" onClick={onClose}>
                        <i className="bi bi-x"></i>
                        Đóng
                    </button>
                    <button className="btn-explore">
                        <i className="bi bi-compass"></i>
                        Khám phá ngành
                    </button>
                </div>
            </div>
        </div>
    );
}
