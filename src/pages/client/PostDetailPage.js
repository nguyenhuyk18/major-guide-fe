import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPostById, getAllPosts } from '../../services/post.api';
import '../../assets/css/PostDetailPage.css';
import {  getUserById } from '../../services/expert.api';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
};

const formatDateShort = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
};

const PostDetailPage = () => {
    const { id } = useParams();
    // const navigate = useNavigate();
    const [post, setPost] = useState(null);
    const [tacGiaInfo , setTacGiaInfo] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [relatedLoading, setRelatedLoading] = useState(true);

    const fetchRelatedPosts = useCallback(async (title) => {
        setRelatedLoading(true);
        try {
            const res = await getAllPosts();
            if (res?.data) {
                const data = Array.isArray(res.data) ? res.data : [];
                const filtered = data
                    .filter(p => p._id !== id)
                    .slice(0, 3);
                setRelatedPosts(filtered);
            }
        } catch (error) {
            console.error('Error fetching related posts:', error);
        } finally {
            setRelatedLoading(false);
        }
    }, [id]);

    const fetchTacGiaInfo = useCallback(async (expertId) => {
        try {
            const res = await getUserById(expertId);
            setTacGiaInfo(res.data.data);
        } catch (error) {
            console.error('Error fetching tac gia info:', error);
        }
    }, []);

    const fetchPost = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getPostById(id);
            if (res?.data) {
                setPost(res.data);
                fetchRelatedPosts(res.data.title);
                fetchTacGiaInfo(res.data.expertId);
            }
        } catch (error) {
            console.error('Error fetching post:', error);
        } finally {
            setLoading(false);
        }
    }, [id, fetchRelatedPosts, fetchTacGiaInfo]);

    useEffect(() => {
        if (id) {
            fetchPost();
        }
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [id, fetchPost]);

    const renderContent = (html) => {
        if (!html) return '';
        return { __html: html };
    };

    if (loading) {
        return (
            <div className="pdp-page">
                <div className="pdp-loading">
                    <div className="pdp-spinner"></div>
                    <span>Đang tải bài viết...</span>
                </div>
            </div>
        );
    }

    if (!post) {
        return (
            <div className="pdp-page">
                <div className="pdp-not-found">
                    <div className="pdp-not-found-icon">
                        <i className="bi bi-file-earmark-x"></i>
                    </div>
                    <h2>Không tìm thấy bài viết</h2>
                    <p>Bài viết này có thể đã bị xóa hoặc không tồn tại.</p>
                    <Link to="/blog" className="pdp-btn-back">
                        <i className="bi bi-arrow-left"></i>
                        Quay lại trang bài viết
                    </Link>
                </div>
            </div>
        );
    }

    // console.log(tacGiaInfo?.name);

    return (
        <div className="pdp-page">
            {/* Breadcrumb */}
            <div className="pdp-breadcrumb">
                <div className="container">
                    <Link to="/" className="pdp-breadcrumb-link">Trang chủ</Link>
                    <i className="bi bi-chevron-right"></i>
                    <Link to="/blog" className="pdp-breadcrumb-link">Bài viết</Link>
                    <i className="bi bi-chevron-right"></i>
                    <span className="pdp-breadcrumb-current">{post.title?.substring(0, 40)}...</span>
                </div>
            </div>

            {/* Hero Image */}
            {post.imageUrl && (
                <div className="pdp-hero-image">
                    <img src={post.imageUrl} alt={post.title} />
                    <div className="pdp-hero-overlay"></div>
                </div>
            )}

            {/* Article */}
            <article className="pdp-article">
                <div className="container">
                    <div className="pdp-article-layout">
                        {/* Main Content */}
                        <div className="pdp-article-main">
                            {/* Header */}
                            <header className="pdp-article-header">
                                <div className="pdp-article-meta-top">
                                    <span className="pdp-date">
                                        <i className="bi bi-calendar3"></i>
                                        {formatDate(post.createdAt)}
                                    </span>
                                    {post.viewCount !== undefined && (
                                        <span className="pdp-views">
                                            <i className="bi bi-eye"></i>
                                            {post.viewCount.toLocaleString('vi-VN')} lượt xem
                                        </span>
                                    )}
                                </div>

                                <h1 className="pdp-article-title">{post.title}</h1>

                                {post.expertId && (
                                    <div className="pdp-author">
                                        <div className="pdp-author-avatar">
                                            {tacGiaInfo?.fileAvartarUrl ? (
                                                <img src={tacGiaInfo?.fileAvartarUrl} alt={tacGiaInfo?.name} />
                                            ) : (
                                                <span>{(tacGiaInfo?.name || 'E').charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <div className="pdp-author-info">
                                            <span className="pdp-author-name">
                                                { tacGiaInfo?.name}
                                            </span>
                                            <span className="pdp-author-role">
                                                <i className="bi bi-patch-check-fill"></i>
                                                Chuyên gia tư vấn
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </header>

                            {/* Featured Image (if exists) */}
                            {post.imageUrl && (
                                <div className="pdp-featured-image">
                                    <img src={post.imageUrl} alt={post.title} />
                                </div>
                            )}

                            {/* Content */}
                            <div
                                className="pdp-article-content"
                                dangerouslySetInnerHTML={renderContent(post.content)}
                            />

                            {/* Share & Actions */}
                            <div className="pdp-article-footer">
                                <div className="pdp-tags">
                                    {post.tags?.map((tag, idx) => (
                                        <span key={idx} className="pdp-tag">
                                            <i className="bi bi-hash"></i>
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="pdp-share">
                                    <span className="pdp-share-label">
                                        <i className="bi bi-share"></i>
                                        Chia sẻ:
                                    </span>
                                    <button
                                        className="pdp-share-btn"
                                        onClick={() => navigator.clipboard?.writeText(window.location.href)}
                                        title="Sao chép liên kết"
                                    >
                                        <i className="bi bi-link-45deg"></i>
                                    </button>
                                </div>
                            </div>

                            {/* Back Button */}
                            <div className="pdp-back-section">
                                <Link to="/blog" className="pdp-btn-back">
                                    <i className="bi bi-arrow-left"></i>
                                    Quay lại danh sách bài viết
                                </Link>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <aside className="pdp-article-sidebar">
                            {/* Related Posts */}
                            <div className="pdp-sidebar-section">
                                <h3 className="pdp-sidebar-title">
                                    <i className="bi bi-journal-text"></i>
                                    Bài viết khác
                                </h3>

                                {relatedLoading ? (
                                    <div className="pdp-sidebar-loading">
                                        <div className="pdp-spinner-small"></div>
                                    </div>
                                ) : relatedPosts.length === 0 ? (
                                    <div className="pdp-sidebar-empty">
                                        <i className="bi bi-inbox"></i>
                                        <span>Chưa có bài viết khác</span>
                                    </div>
                                ) : (
                                    <div className="pdp-related-list">
                                        {relatedPosts.map((rp) => (
                                            <Link key={rp._id} to={`/blog/${rp._id}`} className="pdp-related-item">
                                                <div className="pdp-related-image">
                                                    <img
                                                        src={rp.imageUrl || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=200&q=80'}
                                                        alt={rp.title}
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=200&q=80';
                                                        }}
                                                    />
                                                </div>
                                                <div className="pdp-related-info">
                                                    <span className="pdp-related-title">{rp.title}</span>
                                                    <span className="pdp-related-date">
                                                        <i className="bi bi-calendar3"></i>
                                                        {formatDateShort(rp.createdAt)}
                                                    </span>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Author Card */}
                            {post.expertId && (
                                <div className="pdp-sidebar-section pdp-author-card">
                                    <h3 className="pdp-sidebar-title">
                                        <i className="bi bi-person-badge"></i>
                                        Về tác giả
                                    </h3>
                                    <div className="pdp-author-full">
                                        <div className="pdp-author-avatar-large">
                                            {tacGiaInfo?.fileAvartarUrl ? (
                                                <img src={tacGiaInfo?.fileAvartarUrl} alt={tacGiaInfo?.name} />
                                            ) : (
                                                <span>{(post.expertId.fullName || post.expertId.name || 'E').charAt(0).toUpperCase()}</span>
                                            )}
                                        </div>
                                        <h4 className="pdp-author-name-large">
                                            {tacGiaInfo?.name}
                                        </h4>
                                        <span className="pdp-author-badge">
                                            <i className="bi bi-patch-check-fill"></i>
                                            Chuyên gia tư vấn 
                                        </span>
                                    </div>
                                </div>
                            )}
                        </aside>
                    </div>
                </div>
            </article>
        </div>
    );
};

export default PostDetailPage;
