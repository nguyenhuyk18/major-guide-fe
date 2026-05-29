import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import '../../assets/css/QuizPage.css';
import { getQuestions, saveAnswer, submitTest, getInProgressTest } from '../../services/quiz.api';
import { predictCareer } from '../../services/careerPrediction.api';
import QuizResultModal from '../../components/QuizResultModal';

const QUESTIONS_PER_PAGE = 3;
const SCORE_LABELS = {
    1: 'Hoàn toàn không',
    2: 'Không',
    3: 'Bình thường',
    4: 'Đồng ý',
    5: 'Hoàn toàn đồng ý'
};

export default function QuizPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const userInfo = useSelector(state => state.authClientReducer.loggedUser);
    const isLogin = useSelector(state => state.authClientReducer.isLogin);

    const [questions, setQuestions] = useState([]);
    const [currentPage, setCurrentPage] = useState(0);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const [showExitModal, setShowExitModal] = useState(false);
    const [showResultModal, setShowResultModal] = useState(false);
    const [resultData, setResultData] = useState(null);
    const [careerPrediction, setCareerPrediction] = useState(null);
    const [hasInProgress, setHasInProgress] = useState(false);

    const totalQuestions = questions.length;
    const totalPages = Math.ceil(totalQuestions / QUESTIONS_PER_PAGE);
    const currentQuestions = questions.slice(
        currentPage * QUESTIONS_PER_PAGE,
        (currentPage + 1) * QUESTIONS_PER_PAGE
    );

    useEffect(() => {
        if (!isLogin) {
            toast.error('Vui lòng đăng nhập để làm bài test!');
            navigate('/');
            return;
        }
        fetchQuestions();

        // Check if we should skip intro (coming from QuizHistoryPage with continue action)
        if (location.state?.continueInProgress) {
            setShowIntro(false);
        }
    }, [isLogin, navigate, location.state]);

    const fetchQuestions = async (retryCount = 0) => {
        try {
            setLoading(true);
            const data = await getQuestions();

            if (data && data.length > 0) {
                // Normalize field name from API (question_id) to match code (questionId)
                const normalizedData = data.map(q => ({
                    ...q,
                    questionId: q.question_id || q.questionId
                }));
                setQuestions(normalizedData);

                // Load in-progress test answers
                if (userInfo?.id) {
                    try {
                        const inProgress = await getInProgressTest(userInfo.id);
                        if (inProgress && inProgress.answers && inProgress.answers.length > 0) {
                            const savedAnswers = {};
                            inProgress.answers.forEach(a => {
                                savedAnswers[a.questionId] = a.score;
                            });
                            setAnswers(savedAnswers);
                            setHasInProgress(true);
                            // Check if already completed all questions
                            const answeredCount = inProgress.answers.length;
                            if (answeredCount >= normalizedData.length) {
                                toast.info('Bạn đã hoàn thành tất cả câu hỏi! Hãy nộp bài.');
                            }
                        }
                    } catch (e) {
                        // Ignore in-progress fetch error - user might not have one
                        console.log('No in-progress test found');
                    }
                }
            } else {
                toast.warning('Chưa có câu hỏi nào trong hệ thống!');
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            // Retry up to 2 times
            if (retryCount < 2) {
                toast.info('Đang thử kết nối lại...');
                await new Promise(r => setTimeout(r, 1500));
                return fetchQuestions(retryCount + 1);
            }
            toast.error('Không thể kết nối máy chủ. Vui lòng kiểm tra kết nối mạng.');
        } finally {
            setLoading(false);
        }
    };

    const saveAllProgress = async () => {
        if (!userInfo?.id || Object.keys(answers).length === 0) return;
        try {
            for (const [questionId, score] of Object.entries(answers)) {
                await saveAnswer(userInfo.id, questionId, score);
            }
        } catch (error) {
            console.error('Save progress error:', error);
        }
    };

    const handleSelectAnswer = (questionId, score) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: score
        }));
    };

    const handleNextPage = () => {
        if (currentPage < totalPages - 1) {
            setCurrentPage(prev => prev + 1);
        }
    };

    const handlePrevPage = () => {
        if (currentPage > 0) {
            setCurrentPage(prev => prev - 1);
        }
    };

    const handleExit = () => {
        setShowExitModal(true);
    };

    const confirmExit = async () => {
        setShowExitModal(false);
        await saveAllProgress();
        toast.success('Tiến độ đã được lưu!');
        setShowIntro(true);
        setCurrentPage(0);
    };

    const calculateTraitScores = () => {
        const traitScores = {};
        const traitCounts = {};

        questions.forEach(q => {
            const score = answers[q.questionId];
            if (score !== undefined && q.traits) {
                q.traits.forEach(trait => {
                    traitScores[trait] = (traitScores[trait] || 0) + score;
                    traitCounts[trait] = (traitCounts[trait] || 0) + 1;
                });
            }
        });

        return Object.entries(traitScores).map(([trait, score]) => ({
            trait,
            score,
            count: traitCounts[trait]
        }));
    };

    const handleSubmit = async () => {
        if (Object.keys(answers).length < totalQuestions) {
            toast.error(`Bạn còn ${totalQuestions - Object.keys(answers).length} câu chưa trả lời!`);
            return;
        }

        try {
            setSubmitting(true);

            const answersArray = Object.entries(answers).map(([questionId, score]) => ({
                questionId,
                score
            }));

            const traitScores = calculateTraitScores();
            const totalScore = answersArray.reduce((sum, a) => sum + a.score, 0);

            const result = await submitTest(userInfo.id, answersArray, traitScores, totalScore);
            
            // Call career prediction API
            try {
                const answersForModel = {};
                Object.entries(answers).forEach(([questionId, score]) => {
                    // Convert questionId to q1, q2 format
                    answersForModel[questionId] = score;
                });
                
                const careerResult = await predictCareer(answersForModel);
                if (careerResult?.success) {
                    setCareerPrediction(careerResult.prediction);
                }
            } catch (careerError) {
                console.error('Career prediction error:', careerError);
                // Continue even if career prediction fails
            }
            
            setResultData(result);
            setShowResultModal(true);
            toast.success('Bạn đã hoàn thành bài test!');
        } catch (error) {
            console.error('Submit error:', error);
            toast.error('Không thể nộp bài!');
        } finally {
            setSubmitting(false);
        }
    };

    const isLastPage = currentPage === totalPages - 1;
    const allAnswered = currentQuestions.every(q => answers[q.questionId] !== undefined);
    const globalProgress = (Object.keys(answers).length / totalQuestions) * 100;

    const getGroupColor = (group) => {
        const colors = {
            'A. Logic & phân tích': '#6366f1',
            'B. Công nghệ & hệ thống': '#8b5cf6',
            'C. Dữ liệu & AI thinking': '#ec4899',
            'D. Bảo mật & điều tra': '#f97316',
            'E. Sáng tạo & thiết kế': '#f59e0b',
            'F. Giao tiếp & ảnh hưởng': '#10b981',
            'G. Giúp đỡ con người': '#06b6d4',
            'H. Kỹ thuật thực hành': '#3b82f6',
            'I. Quản lý & tổ chức': '#64748b'
        };
        return colors[group] || '#6366f1';
    };

    if (loading) {
        return (
            <div className="quiz-loading">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <p>Đang tải câu hỏi...</p>
                <button className="btn btn-outline-secondary btn-sm mt-2" onClick={() => fetchQuestions()}>
                    <i className="bi bi-arrow-clockwise"></i>
                    Tải lại
                </button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="quiz-empty">
                <div className="quiz-empty-icon">
                    <i className="bi bi-clipboard-x"></i>
                </div>
                <h3>Chưa có câu hỏi nào</h3>
                <p>Hệ thống chưa có câu hỏi trắc nghiệm nào.</p>
                <button className="btn btn-primary" onClick={() => fetchQuestions()}>
                    <i className="bi bi-arrow-clockwise"></i>
                    Thử lại
                </button>
            </div>
        );
    }

    // Intro Screen
    if (showIntro) {
        return (
            <div className="quiz-page">
                <div className="quiz-content">
                    <div className="quiz-intro">
                        {hasInProgress ? (
                            <>
                                <div className="intro-icon" style={{ background: 'linear-gradient(135deg, #fffbeb, #fef3c7)' }}>
                                    <i className="bi bi-pause-circle-fill" style={{ color: '#f59e0b' }}></i>
                                </div>
                                <h2>Bài test đang dở</h2>
                                <p className="intro-desc">
                                    Bạn có <strong>{Object.keys(answers).length} / {totalQuestions} câu</strong> đã trả lời. 
                                    Tiếp tục để hoàn thành bài test nhé!
                                </p>
                                <div className="intro-stats">
                                    <div className="intro-stat">
                                        <div className="intro-stat-value">{Object.keys(answers).length}</div>
                                        <div className="intro-stat-label">Đã trả lời</div>
                                    </div>
                                    <div className="intro-stat">
                                        <div className="intro-stat-value">{totalQuestions - Object.keys(answers).length}</div>
                                        <div className="intro-stat-label">Còn lại</div>
                                    </div>
                                    <div className="intro-stat">
                                        <div className="intro-stat-value">{Math.round((Object.keys(answers).length / totalQuestions) * 100)}%</div>
                                        <div className="intro-stat-label">Hoàn thành</div>
                                    </div>
                                </div>
                                <div className="intro-actions">
                                    <button className="btn-start-quiz" onClick={() => setShowIntro(false)}>
                                        <i className="bi bi-play-fill"></i>
                                        Tiếp tục làm bài
                                    </button>
                                    <button className="btn-cancel-quiz" onClick={() => navigate('/')}>
                                        Hủy bỏ
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="intro-icon">
                                    <i className="bi bi-clipboard2-check"></i>
                                </div>
                                
                                <h2>Bài đánh giá tính cách</h2>
                                <p className="intro-desc">
                                    Khám phá bản thân qua bài trắc nghiệm về tính cách, sở thích và khả năng của bạn. 
                                    Trả lời trung thực để có kết quả chính xác nhất.
                                </p>

                                <div className="intro-features">
                                    <div className="intro-feature">
                                        <div className="intro-feature-icon">
                                            <i className="bi bi-list-check"></i>
                                        </div>
                                        <div>
                                            <h4>40 câu hỏi</h4>
                                            <p>Đánh giá toàn diện nhiều khía cạnh tính cách</p>
                                        </div>
                                    </div>
                                    <div className="intro-feature">
                                        <div className="intro-feature-icon">
                                            <i className="bi bi-clock"></i>
                                        </div>
                                        <div>
                                            <h4>5 phút</h4>
                                            <p>Thời gian hoàn thành nhanh chóng</p>
                                        </div>
                                    </div>
                                    <div className="intro-feature">
                                        <div className="intro-feature-icon">
                                            <i className="bi bi-shield-check"></i>
                                        </div>
                                        <div>
                                            <h4>Bảo mật</h4>
                                            <p>Kết quả chỉ hiển thị với bạn</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="intro-stats">
                                    <div className="intro-stat">
                                        <div className="intro-stat-value">40</div>
                                        <div className="intro-stat-label">Câu hỏi</div>
                                    </div>
                                    <div className="intro-stat">
                                        <div className="intro-stat-value">15</div>
                                        <div className="intro-stat-label">Tính cách đo</div>
                                    </div>
                                    <div className="intro-stat">
                                        <div className="intro-stat-value">9</div>
                                        <div className="intro-stat-label">Nhóm</div>
                                    </div>
                                </div>

                                <div className="intro-actions">
                                    <button className="btn-start-quiz" onClick={() => setShowIntro(false)}>
                                        <i className="bi bi-play-fill"></i>
                                        Bắt đầu làm test
                                    </button>
                                    <button className="btn-cancel-quiz" onClick={() => navigate('/')}>
                                        Hủy bỏ
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="quiz-page">
            {/* Header */}
            <div className="quiz-header">
                <div className="quiz-header-left">
                    <button className="btn-exit" onClick={handleExit}>
                        <i className="bi bi-x-lg"></i>
                        Thoát
                    </button>
                </div>
                <div className="quiz-header-center">
                    <h1 className="quiz-title">
                        <i className="bi bi-clipboard2-check"></i>
                        Bài đánh giá tính cách
                    </h1>
                </div>
                <div className="quiz-header-right">
                    <div className="quiz-progress-text">
                        <span>{Object.keys(answers).length}</span> / {totalQuestions} câu
                    </div>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="quiz-progress-bar">
                <div 
                    className="quiz-progress-fill" 
                    style={{ width: `${globalProgress}%` }}
                ></div>
            </div>

            {/* Question Navigator */}
            <div className="question-navigator">
                <div className="navigator-scroll">
                    {questions.map((q, index) => (
                        <div 
                            key={q.questionId}
                            className={`navigator-item ${
                                answers[q.questionId] !== undefined ? 'answered' : ''
                            } ${Math.floor(index / QUESTIONS_PER_PAGE) === currentPage ? 'current' : ''}`}
                            onClick={() => setCurrentPage(Math.floor(index / QUESTIONS_PER_PAGE))}
                        >
                            {index + 1}
                        </div>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="quiz-content">
                <div className="quiz-card">
                    {/* Page Indicator */}
                    <div className="page-indicator">
                        <span className="current-page">{currentPage + 1}</span>
                        <span className="separator">/</span>
                        <span className="total-pages">{totalPages}</span>
                        <span className="page-label">trang</span>
                    </div>

                    {/* Questions */}
                    <div className="questions-container">
                        {currentQuestions.map((q, index) => (
                            <div key={q.questionId} className="question-item">
                                <div className="question-header">
                                    <span className="question-number">Câu {currentPage * QUESTIONS_PER_PAGE + index + 1}</span>
                                    <span 
                                        className="question-group-badge"
                                        style={{ backgroundColor: getGroupColor(q.group) }}
                                    >
                                        {q.group}
                                    </span>
                                </div>
                                
                                <p className="question-text">{q.text}</p>

                                <div className="answer-options">
                                    {[1, 2, 3, 4, 5].map(score => (
                                        <button
                                            key={`${q.questionId}-${score}`}
                                            className={`answer-option ${
                                                answers[q.questionId] === score ? 'selected' : ''
                                            }`}
                                            onClick={() => handleSelectAnswer(q.questionId, score)}
                                        >
                                            <span className="option-score">{score}</span>
                                            <span className="option-label">{SCORE_LABELS[score]}</span>
                                        </button>
                                    ))}
                                </div>

                                <div className="selected-indicator">
                                    {answers[q.questionId] !== undefined ? (
                                        <span className="answered-text">
                                            <i className="bi bi-check-circle-fill"></i>
                                            Đã chọn: {answers[q.questionId]}
                                        </span>
                                    ) : (
                                        <span className="unanswered-text">
                                            <i className="bi bi-circle"></i>
                                            Chưa trả lời
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Navigation */}
                    <div className="quiz-navigation">
                        <button
                            className="btn-nav btn-prev"
                            onClick={handlePrevPage}
                            disabled={currentPage === 0}
                        >
                            <i className="bi bi-chevron-left"></i>
                            Trước
                        </button>

                        <div className="nav-center">
                            {Array.from({ length: totalPages }, (_, i) => (
                                <span 
                                    key={i}
                                    className={`nav-dot ${i === currentPage ? 'active' : ''}`}
                                    onClick={() => setCurrentPage(i)}
                                ></span>
                            ))}
                        </div>

                        {isLastPage ? (
                            <button
                                className="btn-nav btn-submit"
                                onClick={handleSubmit}
                                disabled={submitting || Object.keys(answers).length < totalQuestions}
                            >
                                {submitting ? (
                                    <>
                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                        Đang nộp...
                                    </>
                                ) : (
                                    <>
                                        <i className="bi bi-check2-all"></i>
                                        Nộp bài
                                    </>
                                )}
                            </button>
                        ) : (
                            <button
                                className="btn-nav btn-next"
                                onClick={handleNextPage}
                                disabled={!allAnswered}
                            >
                                Tiếp theo
                                <i className="bi bi-chevron-right"></i>
                            </button>
                        )}
                    </div>

                    {!allAnswered && (
                        <div className="unanswered-warning">
                            <i className="bi bi-exclamation-triangle"></i>
                            Vui lòng trả lời tất cả câu hỏi
                        </div>
                    )}
                </div>
            </div>

            {/* Exit Modal */}
            {showExitModal && (
                <div className="modal-overlay" onClick={() => setShowExitModal(false)}>
                    <div className="quiz-exit-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-exit">
                            <i className="bi bi-exclamation-circle"></i>
                            <h3>Xác nhận thoát?</h3>
                        </div>
                        <p>Tiến độ làm bài sẽ được lưu lại. Bạn có thể tiếp tục làm sau.</p>
                        <div className="modal-actions">
                            <button className="btn-secondary" onClick={() => setShowExitModal(false)}>
                                Tiếp tục làm
                            </button>
                            <button className="btn-danger" onClick={confirmExit}>
                                <i className="bi bi-box-arrow-right"></i>
                                Thoát và lưu
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Result Modal */}
            {showResultModal && resultData && (
                <QuizResultModal
                    show={showResultModal}
                    onClose={() => {
                        setShowResultModal(false);
                        setCareerPrediction(null);
                        navigate('/quiz-history');
                    }}
                    result={resultData}
                    careerPrediction={careerPrediction}
                />
            )}
        </div>
    );
}
