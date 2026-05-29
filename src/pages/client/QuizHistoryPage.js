import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import '../../assets/css/QuizHistoryPage.css';
import { getTestResultsByUser } from '../../services/quiz.api';
import { predictCareer } from '../../services/careerPrediction.api';
import QuizHistoryDetailModal from '../../components/QuizHistoryDetailModal';
import CareerAnalysisModal from '../../components/CareerAnalysisModal';

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

export default function QuizHistoryPage() {
    const navigate = useNavigate();
    const userInfo = useSelector(state => state.authClientReducer.loggedUser);
    const isLogin = useSelector(state => state.authClientReducer.isLogin);

    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedResult, setSelectedResult] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCareerModal, setShowCareerModal] = useState(false);
    const [analyzingResult, setAnalyzingResult] = useState(null);
    const [careerAnalysis, setCareerAnalysis] = useState(null);

    useEffect(() => {
        if (!isLogin) {
            toast.error('Vui lòng đăng nhập để xem lịch sử!');
            navigate('/');
            return;
        }
        fetchResults();
    }, [isLogin, navigate]);

    const fetchResults = async () => {
        try {
            setLoading(true);

            // Fetch all tests
            const data = await getTestResultsByUser(userInfo.id);
            if (data && data.length > 0) {
                // Sort all by updatedAt descending (most recent first)
                const sorted = [...data].sort((a, b) =>
                    new Date(b.updatedAt || b.completedAt) - new Date(a.updatedAt || a.completedAt)
                );
                setResults(sorted);
            }
        } catch (error) {
            console.error('Error fetching results:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewDetail = (result) => {
        setSelectedResult(result);
        setShowDetailModal(true);
    };

    const handleStartNewTest = () => {
        navigate('/quiz');
    };

    const handleContinueTest = (result) => {
        navigate('/quiz', { state: { continueInProgress: true, resultId: result._id } });
    };

    const handleAnalyzeCareer = async (result) => {
        if (!result.answers || result.answers.length === 0) {
            toast.error('Không có đủ dữ liệu để phân tích!');
            return;
        }

        setAnalyzingResult(result);
        setShowCareerModal(true);

        try {
            const answersForModel = {};
            result.answers.forEach(answer => {
                answersForModel[answer.questionId] = answer.score;
            });

            const prediction = await predictCareer(answersForModel);
            if (prediction?.success) {
                setCareerAnalysis(prediction.prediction);
            } else {
                setCareerAnalysis(null);
                toast.error('Không thể phân tích ngành. Vui lòng thử lại.');
            }
        } catch (error) {
            console.error('Career analysis error:', error);
            setCareerAnalysis(null);
            toast.error('Đã xảy ra lỗi khi phân tích ngành!');
        }
    };

    const handleCloseCareerModal = () => {
        setShowCareerModal(false);
        setAnalyzingResult(null);
        setCareerAnalysis(null);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('vi-VN', {
            weekday: 'long',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTopTraits = (traitScores) => {
        if (!traitScores || traitScores.length === 0) return [];
        return [...traitScores]
            .sort((a, b) => b.score - a.score)
            .slice(0, 3);
    };

    const getAverageScore = (result) => {
        if (!result.answers || result.answers.length === 0) return 0;
        return (result.totalScore / result.answers.length).toFixed(1);
    };

    const totalTests = results.length;
    const avgAllScore = results.length > 0 
        ? (results.reduce((sum, r) => sum + r.totalScore, 0) / results.length).toFixed(0)
        : 0;

    if (loading) {
        return (
            <div className="quiz-history-loading">
                <div className="loading-spinner">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
                <p>Đang tải lịch sử...</p>
                <button className="btn btn-outline-secondary btn-sm" onClick={fetchResults}>
                    <i className="bi bi-arrow-clockwise"></i>
                    Tải lại
                </button>
            </div>
        );
    }

    return (
        <div className="quiz-history-page">
            <div className="container py-4">
                {/* Header */}
                <div className="quiz-history-header">
                    <div>
                        <h1 className="page-title">
                            <i className="bi bi-clock-history"></i>
                            Lịch sử bài test
                        </h1>
                        <p className="page-subtitle">
                            Xem lại kết quả các bài đánh giá tính cách của bạn
                        </p>
                    </div>
                    <button className="btn btn-primary btn-lg" onClick={handleStartNewTest}>
                        <i className="bi bi-plus-lg"></i>
                        Làm bài test mới
                    </button>
                </div>

                {/* Stats Overview */}
                {results.length > 0 && (
                    <div className="history-stats">
                        <div className="stat-card">
                            <div className="stat-icon-wrapper">
                                <i className="bi bi-clipboard-check"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-number">{totalTests}</span>
                                <span className="stat-label">Bài đã làm</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper total">
                                <i className="bi bi-calculator"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-number">{avgAllScore}</span>
                                <span className="stat-label">Điểm TB</span>
                            </div>
                        </div>
                        <div className="stat-card">
                            <div className="stat-icon-wrapper score">
                                <i className="bi bi-graph-up"></i>
                            </div>
                            <div className="stat-content">
                                <span className="stat-number">
                                    {results.length > 0 ? Math.max(...results.map(r => r.totalScore)) : 0}
                                </span>
                                <span className="stat-label">Điểm cao nhất</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results List */}
                {results.length === 0 ? (
                    <div className="history-empty">
                        <div className="empty-illustration">
                            <i className="bi bi-clipboard-x"></i>
                        </div>
                        <h3>Bạn chưa làm bài test nào</h3>
                        <p>Hãy làm bài đánh giá tính cách để khám phá bản thân nhé!</p>
                        <button className="btn btn-primary btn-lg" onClick={handleStartNewTest}>
                            <i className="bi bi-play-fill"></i>
                            Bắt đầu làm test
                        </button>
                    </div>
                ) : (
                    <div className="history-list">
                        {results.map((result, index) => {
                            const topTraits = getTopTraits(result.traitScores);
                            const isInProgress = result.isCompleted === false;
                            
                            return (
                                <div 
                                    key={result._id || index} 
                                    className={`history-card ${isInProgress ? 'in-progress' : ''}`}
                                    onClick={() => isInProgress ? handleContinueTest(result) : handleViewDetail(result)}
                                >
                                    <div className="history-card-main">
                                        <div className="card-index">
                                            <span className={`index-number ${isInProgress ? 'in-progress' : ''}`}>
                                                {isInProgress ? (
                                                    <i className="bi bi-pause-circle-fill"></i>
                                                ) : (
                                                    index + 1
                                                )}
                                            </span>
                                        </div>
                                        
                                        <div className="card-info">
                                            <div className="card-header-row">
                                                <h3 className="card-title">
                                                    {isInProgress ? (
                                                        <i className="bi bi-pause-circle"></i>
                                                    ) : (
                                                        <i className="bi bi-clipboard2-check"></i>
                                                    )}
                                                    Bài test #{result.testId}
                                                    {isInProgress && (
                                                        <span className="status-badge in-progress">Đang dở</span>
                                                    )}
                                                </h3>
                                                <span className="card-date">
                                                    <i className="bi bi-calendar3"></i>
                                                    {formatDate(result.completedAt || result.updatedAt)}
                                                </span>
                                            </div>
                                            
                                            <div className="card-stats-row">
                                                <div className="card-stat">
                                                    <span className="stat-value">{result.answers?.length || 0}</span>
                                                    <span className="stat-name">Câu hỏi</span>
                                                </div>
                                                {isInProgress ? (
                                                    <>
                                                        <div className="card-stat">
                                                            <span className="stat-value">{40 - (result.answers?.length || 0)}</span>
                                                            <span className="stat-name">Còn lại</span>
                                                        </div>
                                                        <div className="card-stat highlight">
                                                            <span className="stat-value">
                                                                {Math.round(((result.answers?.length || 0) / 40) * 100)}%
                                                            </span>
                                                            <span className="stat-name">Hoàn thành</span>
                                                        </div>
                                                    </>
                                                ) : (
                                                    <>
                                                        <div className="card-stat highlight">
                                                            <span className="stat-value">{result.totalScore}</span>
                                                            <span className="stat-name">Tổng điểm</span>
                                                        </div>
                                                        <div className="card-stat">
                                                            <span className="stat-value">
                                                                {result.traitScores?.length || 0}
                                                            </span>
                                                            <span className="stat-name">Traits</span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="card-top-traits">
                                            {isInProgress ? (
                                                <>
                                                    <span className="traits-label" style={{ color: '#b45309' }}>
                                                        <i className="bi bi-hourglass-split"></i>
                                                        Tiến độ
                                                    </span>
                                                    <div className="progress-bar-mini">
                                                        <div 
                                                            className="progress-bar-mini-fill" 
                                                            style={{ width: `${Math.round(((result.answers?.length || 0) / 40) * 100)}%` }}
                                                        ></div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <span className="traits-label">
                                                        <i className="bi bi-stars"></i>
                                                        Top traits
                                                    </span>
                                                    <div className="traits-mini">
                                                        {topTraits.map(trait => (
                                                            <span 
                                                                key={trait.trait}
                                                                className="trait-mini-badge"
                                                                style={{ 
                                                                    backgroundColor: `${TRAIT_COLORS[trait.trait]}20`,
                                                                    color: TRAIT_COLORS[trait.trait],
                                                                    borderColor: TRAIT_COLORS[trait.trait]
                                                                }}
                                                            >
                                                                {TRAIT_LABELS[trait.trait] || trait.trait}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                        
                                        <div className="card-actions">
                                            {isInProgress ? (
                                                <button className="btn-continue-small">
                                                    <i className="bi bi-play-fill"></i>
                                                    Tiếp tục
                                                </button>
                                            ) : (
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-analyze-career"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAnalyzeCareer(result);
                                                        }}
                                                        title="Phân tích ngành phù hợp"
                                                    >
                                                        <i className="bi bi-mortarboard-fill"></i>
                                                        Phân tích ngành
                                                    </button>
                                                    <i className="bi bi-chevron-right card-arrow"></i>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedResult && (
                <QuizHistoryDetailModal
                    show={showDetailModal}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedResult(null);
                    }}
                    result={selectedResult}
                />
            )}

            {/* Career Analysis Modal */}
            {showCareerModal && analyzingResult && (
                <CareerAnalysisModal
                    show={showCareerModal}
                    onClose={handleCloseCareerModal}
                    result={analyzingResult}
                    careerAnalysis={careerAnalysis}
                />
            )}
        </div>
    );
}
