import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserById } from '../../services/expert.api';
import {
    createExpertReview,
    deleteExpertReview,
    getExpertReviews,
    updateExpertReview
} from '../../services/review.api';
import '../../assets/css/ExpertDetailPage.css';
import { careerFamilyName } from '../../constants/careerFamilies';

const levelLabels = {
    bachelor: 'Cử nhân',
    master: 'Thạc sĩ',
    doctor: 'Tiến sĩ',
    professor: 'Giáo sư'
};

const Stars = ({ value }) => (
    <span className="expert-detail-stars">
        {[1, 2, 3, 4, 5].map(star => (
            <i key={star} className={`bi ${star <= value ? 'bi-star-fill' : 'bi-star'}`}></i>
        ))}
    </span>
);

export default function ExpertDetailPage() {
    const { id } = useParams();
    const auth = useSelector(state => state.authClientReducer);
    const currentUser = auth?.loggedUser;
    const isMember = auth?.isLogin && currentUser?.role_name === 'member';
    const [expert, setExpert] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');
    const [reviews, setReviews] = useState([]);
    const [reviewSummary, setReviewSummary] = useState({ averageRating: 0, totalReviews: 0 });
    const [reviewPage, setReviewPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [reviewsLoading, setReviewsLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editRating, setEditRating] = useState(0);
    const [editComment, setEditComment] = useState('');
    const [savingId, setSavingId] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const reviewLimit = 5;

    useEffect(() => {
        const fetchExpert = async () => {
            setLoading(true);
            setError('');
            try {
                const response = await getUserById(id);
                const user = response?.data?.data;
                if (!user || user.roleName !== 'expert') {
                    setError('Không tìm thấy thông tin chuyên gia.');
                } else {
                    setExpert(user);
                }
            } catch (err) {
                console.error('Lỗi tải chi tiết chuyên gia:', err);
                setError('Không thể tải thông tin chuyên gia. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };
        fetchExpert();
    }, [id]);

    useEffect(() => {
        const fetchReviews = async () => {
            setReviewsLoading(true);
            try {
                const response = await getExpertReviews(id, reviewPage, reviewLimit);
                const data = response?.data?.data || {};
                setReviews(data.reviews || []);
                setReviewSummary({
                    averageRating: Number(data.averageRating) || 0,
                    totalReviews: Number(data.totalReviews) || 0
                });
                setTotalPages(Number(data.totalPages) || 0);
            } catch (err) {
                console.error('Lỗi tải đánh giá:', err);
                toast.error(err?.response?.data?.message || 'Không thể tải danh sách đánh giá.');
            } finally {
                setReviewsLoading(false);
            }
        };
        fetchReviews();
    }, [id, reviewPage]);

    const refreshReviews = async (targetPage = reviewPage) => {
        const response = await getExpertReviews(id, targetPage, reviewLimit);
        const data = response?.data?.data || {};
        setReviews(data.reviews || []);
        setReviewSummary({
            averageRating: Number(data.averageRating) || 0,
            totalReviews: Number(data.totalReviews) || 0
        });
        setTotalPages(Number(data.totalPages) || 0);
        if (targetPage !== reviewPage) setReviewPage(targetPage);
    };

    const addReview = async (event) => {
        event.preventDefault();
        if (!isMember) {
            toast.error('Vui lòng đăng nhập bằng tài khoản thành viên để đánh giá.');
            return;
        }
        if (!rating) {
            toast.error('Vui lòng chọn số sao đánh giá.');
            return;
        }

        setSubmitting(true);
        try {
            await createExpertReview(id, {
                rating,
                comment: comment.trim()
            });
            setRating(0);
            setHoverRating(0);
            setComment('');
            await refreshReviews(1);
            toast.success('Đã gửi đánh giá của bạn.');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Không thể gửi đánh giá.');
        } finally {
            setSubmitting(false);
        }
    };

    const startEditing = (review) => {
        setEditingId(review.id);
        setEditRating(review.rating);
        setEditComment(review.comment || '');
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditRating(0);
        setEditComment('');
    };

    const saveReview = async (reviewId) => {
        if (!editRating) {
            toast.error('Vui lòng chọn số sao đánh giá.');
            return;
        }
        setSavingId(reviewId);
        try {
            await updateExpertReview(reviewId, {
                rating: editRating,
                comment: editComment.trim()
            });
            cancelEditing();
            await refreshReviews();
            toast.success('Đã cập nhật đánh giá.');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Không thể cập nhật đánh giá.');
        } finally {
            setSavingId(null);
        }
    };

    const removeReview = async (reviewId) => {
        if (!window.confirm('Bạn có chắc muốn xóa đánh giá này?')) return;
        setDeletingId(reviewId);
        try {
            await deleteExpertReview(reviewId);
            const targetPage = reviews.length === 1 && reviewPage > 1
                ? reviewPage - 1
                : reviewPage;
            await refreshReviews(targetPage);
            toast.success('Đã xóa đánh giá.');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Không thể xóa đánh giá.');
        } finally {
            setDeletingId(null);
        }
    };

    if (loading) {
        return <div className="expert-detail-state"><div className="spinner-border text-primary"></div><p>Đang tải hồ sơ chuyên gia...</p></div>;
    }

    if (error || !expert) {
        return (
            <div className="expert-detail-state">
                <span><i className="bi bi-person-x"></i></span>
                <h2>Không tìm thấy chuyên gia</h2>
                <p>{error}</p>
                <Link to="/experts">Quay lại danh sách</Link>
            </div>
        );
    }

    const profile = expert.expertProfile || {};
    const expertId = expert.id || expert._id;
    const averageRating = reviewSummary.averageRating.toFixed(1);
    const price = profile.price == null ? 'Liên hệ' : `${new Intl.NumberFormat('vi-VN').format(profile.price)}đ / buổi`;

    return (
        <div className="expert-detail-page">
            <section className="expert-detail-hero">
                <div className="container">
                    <Link to="/experts" className="expert-detail-breadcrumb"><i className="bi bi-arrow-left"></i> Danh sách chuyên gia</Link>
                    <div className="expert-detail-profile">
                        <div className="expert-detail-avatar">
                            {expert.fileAvartarUrl
                                ? <img src={expert.fileAvartarUrl} alt={expert.name} />
                                : <span>{expert.name?.charAt(0)?.toUpperCase() || 'E'}</span>}
                            <i className="expert-detail-online"></i>
                        </div>
                        <div className="expert-detail-heading">
                            <span className="expert-detail-verified"><i className="bi bi-patch-check-fill"></i> Chuyên gia đã xác minh</span>
                            <h1>{expert.name}</h1>
                            <p>{profile.major || 'Chuyên gia tư vấn hướng nghiệp'}</p>
                            <div>
                                <span><i className="bi bi-star-fill"></i><strong>{averageRating}</strong> ({reviewSummary.totalReviews} đánh giá)</span>
                                <span><i className="bi bi-building"></i>{profile.teachAt || 'Đang cập nhật nơi công tác'}</span>
                            </div>
                        </div>
                        <div className="expert-detail-actions">
                            <Link to={`/choose-schedule?expert_id=${expertId}`}><i className="bi bi-calendar2-check"></i> Đặt lịch tư vấn</Link>
                            <Link className="expert-detail-message-link" to={`/messages?expert_id=${expertId}`}><i className="bi bi-chat-dots"></i> Nhắn tin</Link>
                        </div>
                    </div>
                </div>
            </section>

            <main className="expert-detail-content">
                <div className="container expert-detail-layout">
                    <div className="expert-detail-main">
                        <section className="expert-detail-card expert-detail-about">
                            <div className="expert-detail-title">
                                <span><i className="bi bi-person-lines-fill"></i></span>
                                <div><small>Giới thiệu</small><h2>Thông tin chuyên gia</h2></div>
                            </div>
                            <p>{profile.information || 'Chuyên gia chưa cập nhật phần giới thiệu.'}</p>
                            <div className="expert-detail-info-grid">
                                <div><i className="bi bi-mortarboard"></i><p><small>Học vị</small><strong>{levelLabels[profile.level] || profile.level || 'Đang cập nhật'}</strong></p></div>
                                <div><i className="bi bi-briefcase"></i><p><small>Nơi công tác</small><strong>{profile.teachAt || 'Đang cập nhật'}</strong></p></div>
                                <div><i className="bi bi-award"></i><p><small>Chuyên môn</small><strong>{profile.major || 'Đang cập nhật'}</strong></p></div>
                                <div><i className="bi bi-translate"></i><p><small>Ngôn ngữ</small><strong>Tiếng Việt</strong></p></div>
                            </div>
                            {profile.careerFamilies?.length > 0 && (
                                <div className="expert-detail-families">
                                    <small>Tư vấn nhóm ngành</small>
                                    <div>
                                        {profile.careerFamilies.map((code) => <span key={code}>{careerFamilyName(code)}</span>)}
                                    </div>
                                </div>
                            )}
                        </section>

                        <section className="expert-detail-card expert-reviews">
                            <div className="expert-review-heading">
                                <div className="expert-detail-title">
                                    <span><i className="bi bi-chat-square-heart"></i></span>
                                    <div><small>Phản hồi</small><h2>Bình luận và đánh giá</h2></div>
                                </div>
                                <div className="expert-review-score"><strong>{averageRating}</strong><div><Stars value={Math.round(reviewSummary.averageRating)} /><small>{reviewSummary.totalReviews} đánh giá</small></div></div>
                            </div>

                            {isMember ? (
                                <form className="expert-review-form" onSubmit={addReview}>
                                    <div><strong>Chia sẻ trải nghiệm của bạn</strong>
                                        <span className="expert-rating-picker" onMouseLeave={() => setHoverRating(0)}>
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <button type="button" key={star} aria-label={`${star} sao`} onMouseEnter={() => setHoverRating(star)} onClick={() => setRating(star)}>
                                                    <i className={`bi ${star <= (hoverRating || rating) ? 'bi-star-fill' : 'bi-star'}`}></i>
                                                </button>
                                            ))}
                                        </span>
                                    </div>
                                    <textarea maxLength="1000" rows="3" value={comment} onChange={event => setComment(event.target.value)} placeholder="Viết bình luận về chuyên gia (không bắt buộc)..." />
                                    <div className="expert-review-form-footer">
                                        <small>{comment.length}/1000</small>
                                        <button type="submit" disabled={!rating || submitting}>
                                            {submitting ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-send"></i>}
                                            {submitting ? ' Đang gửi...' : ' Gửi đánh giá'}
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="expert-review-login-note">
                                    <i className="bi bi-info-circle"></i>
                                    Đăng nhập bằng tài khoản thành viên để gửi đánh giá.
                                </div>
                            )}

                            <div className="expert-review-list">
                                {reviewsLoading ? (
                                    <div className="expert-review-status"><span className="spinner-border spinner-border-sm"></span> Đang tải đánh giá...</div>
                                ) : reviews.length === 0 ? (
                                    <div className="expert-review-status"><i className="bi bi-chat-square-text"></i> Chưa có đánh giá nào.</div>
                                ) : reviews.map(review => {
                                    const reviewer = review.reviewer || {};
                                    const reviewerName = reviewer.name || 'Thành viên';
                                    const isOwner = isMember && String(reviewer.id) === String(currentUser?.id || currentUser?._id);
                                    const isEditing = editingId === review.id;
                                    return (
                                        <article key={review.id}>
                                            <span className="expert-review-avatar">
                                                {reviewer.avatar
                                                    ? <img src={reviewer.avatar} alt={reviewerName} />
                                                    : reviewerName.charAt(0).toUpperCase()}
                                            </span>
                                            <div>
                                                <header>
                                                    <p>
                                                        <strong>{reviewerName}{isOwner && <em>Bạn</em>}</strong>
                                                        <small>{new Date(review.createdAt).toLocaleDateString('vi-VN')}</small>
                                                    </p>
                                                    <div className="expert-review-header-actions">
                                                        {!isEditing && <Stars value={review.rating} />}
                                                        {isOwner && !isEditing && (
                                                            <span>
                                                                <button type="button" onClick={() => startEditing(review)} aria-label="Sửa đánh giá"><i className="bi bi-pencil"></i></button>
                                                                <button type="button" className="danger" disabled={deletingId === review.id} onClick={() => removeReview(review.id)} aria-label="Xóa đánh giá">
                                                                    <i className={`bi ${deletingId === review.id ? 'bi-hourglass-split' : 'bi-trash3'}`}></i>
                                                                </button>
                                                            </span>
                                                        )}
                                                    </div>
                                                </header>
                                                {isEditing ? (
                                                    <div className="expert-review-edit">
                                                        <span className="expert-rating-picker">
                                                            {[1, 2, 3, 4, 5].map(star => (
                                                                <button type="button" key={star} onClick={() => setEditRating(star)} aria-label={`${star} sao`}>
                                                                    <i className={`bi ${star <= editRating ? 'bi-star-fill' : 'bi-star'}`}></i>
                                                                </button>
                                                            ))}
                                                        </span>
                                                        <textarea maxLength="1000" rows="3" value={editComment} onChange={event => setEditComment(event.target.value)} />
                                                        <div>
                                                            <small>{editComment.length}/1000</small>
                                                            <span>
                                                                <button type="button" onClick={cancelEditing}>Hủy</button>
                                                                <button type="button" disabled={!editRating || savingId === review.id} onClick={() => saveReview(review.id)}>
                                                                    {savingId === review.id ? 'Đang lưu...' : 'Lưu thay đổi'}
                                                                </button>
                                                            </span>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p>{review.comment || <em>Không có nội dung bình luận.</em>}</p>
                                                )}
                                            </div>
                                        </article>
                                    );
                                })}
                            </div>
                            {totalPages > 1 && (
                                <nav className="expert-review-pagination" aria-label="Phân trang đánh giá">
                                    <button type="button" disabled={reviewPage === 1 || reviewsLoading} onClick={() => setReviewPage(page => page - 1)}>
                                        <i className="bi bi-chevron-left"></i>
                                    </button>
                                    {Array.from({ length: totalPages }, (_, index) => index + 1)
                                        .filter(page => page === 1 || page === totalPages || Math.abs(page - reviewPage) <= 1)
                                        .map((page, index, pages) => (
                                            <span key={page}>
                                                {index > 0 && page - pages[index - 1] > 1 && <small>…</small>}
                                                <button type="button" className={page === reviewPage ? 'active' : ''} disabled={reviewsLoading} onClick={() => setReviewPage(page)}>{page}</button>
                                            </span>
                                        ))}
                                    <button type="button" disabled={reviewPage === totalPages || reviewsLoading} onClick={() => setReviewPage(page => page + 1)}>
                                        <i className="bi bi-chevron-right"></i>
                                    </button>
                                </nav>
                            )}
                        </section>
                    </div>

                    <aside className="expert-detail-sidebar">
                        <div className="expert-detail-card expert-price-card">
                            <small>Phí tư vấn từ</small><strong>{price}</strong>
                            <ul>
                                <li><i className="bi bi-check-circle-fill"></i>Tư vấn trực tuyến 1:1</li>
                                <li><i className="bi bi-check-circle-fill"></i>Lộ trình phù hợp cá nhân</li>
                                <li><i className="bi bi-check-circle-fill"></i>Trao đổi trực tiếp với chuyên gia</li>
                            </ul>
                            <Link to={`/choose-schedule?expert_id=${expertId}`}>Chọn lịch tư vấn <i className="bi bi-arrow-right"></i></Link>
                        </div>
                        <div className="expert-detail-card expert-response-card">
                            <span><i className="bi bi-lightning-charge-fill"></i></span>
                            <div><strong>Phản hồi nhanh</strong><p>Chuyên gia thường phản hồi tin nhắn trong vòng vài giờ.</p></div>
                        </div>
                    </aside>
                </div>
            </main>

        </div>
    );
}
