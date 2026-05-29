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

export default function QuizHistoryDetailModal({ show, onClose, result }) {
    if (!show || !result) return null;

    const sortedTraits = [...(result.traitScores || [])].sort((a, b) => b.score - a.score);
    const maxScore = sortedTraits.length > 0 ? sortedTraits[0].score : 1;

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getBarWidth = (score) => {
        return Math.min((score / maxScore) * 100, 100);
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="result-modal-content history-detail-modal" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <div className="result-modal-header">
                    <button className="btn-close-modal" onClick={onClose}>
                        <i className="bi bi-x-lg"></i>
                    </button>
                    <div className="result-success-icon history">
                        <i className="bi bi-clipboard2-check"></i>
                    </div>
                    <h2>Chi tiết bài test</h2>
                    <p className="result-test-id">
                        <strong>{result.testId}</strong>
                    </p>
                    <p className="result-completed-at">
                        {formatDate(result.completedAt)}
                    </p>
                </div>

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

                {/* All Traits */}
                <div className="result-traits">
                    <h3>
                        <i className="bi bi-bar-chart"></i>
                        Phân tích tính cách chi tiết
                    </h3>
                    
                    <div className="traits-list">
                        {sortedTraits.map((trait, index) => (
                            <div key={trait.trait} className="trait-item">
                                <div className="trait-rank">
                                    #{index + 1}
                                </div>
                                <div className="trait-icon" 
                                    style={{ 
                                        backgroundColor: `${TRAIT_COLORS[trait.trait]}20`, 
                                        color: TRAIT_COLORS[trait.trait] 
                                    }}>
                                    <i className={`bi ${TRAIT_ICONS[trait.trait] || 'bi-person'}`}></i>
                                </div>
                                <div className="trait-info">
                                    <div className="trait-name-row">
                                        <span className="trait-name">
                                            {TRAIT_LABELS[trait.trait] || trait.trait}
                                        </span>
                                        <span className="trait-score">
                                            {trait.score} điểm / {trait.count} câu
                                        </span>
                                    </div>
                                    <div className="trait-bar-bg">
                                        <div 
                                            className="trait-bar-fill"
                                            style={{ 
                                                width: `${getBarWidth(trait.score)}%`,
                                                backgroundColor: TRAIT_COLORS[trait.trait]
                                            }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Answers Summary */}
                <div className="answers-summary">
                    <h3>
                        <i className="bi bi-check2-square"></i>
                        Tổng hợp đáp án
                    </h3>
                    <div className="answers-grid">
                        {(result.answers || []).map((answer, index) => (
                            <div key={index} className="answer-chip">
                                <span className="answer-question">{answer.questionId}</span>
                                <span className="answer-score">{answer.score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="result-actions">
                    <button className="btn btn-outline-light" onClick={onClose}>
                        <i className="bi bi-x"></i>
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
}
