import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../../services/post.api';
import '../../assets/css/BlogPage.css';

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', {
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

const BlogPage = () => {
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            const res = await getAllPosts();
            if (res?.data?.data?.posts) {
                const data = Array.isArray(res.data.data.posts) ? res.data.data.posts : [];
                setPosts(data);
                setFilteredPosts(data);
            }
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    const filterAndSortPosts = useCallback(() => {
        let result = [...posts];

        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(post =>
                (post.title && post.title.toLowerCase().includes(term)) ||
                (post.content && post.content.toLowerCase().includes(term))
            );
        }

        result.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0);
            const dateB = new Date(b.createdAt || 0);

            switch (sortBy) {
                case 'newest': return dateB - dateA;
                case 'oldest': return dateA - dateB;
                case 'title_asc': return (a.title || '').localeCompare(b.title || '');
                case 'title_desc': return (b.title || '').localeCompare(a.title || '');
                default: return dateB - dateA;
            }
        });

        setFilteredPosts(result);
    }, [posts, searchTerm, sortBy]);

    useEffect(() => {
        filterAndSortPosts();
    }, [posts, searchTerm, sortBy, filterAndSortPosts]);

    const renderExcerpt = (html, maxLength = 150) => {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        const text = div.textContent || div.innerText || '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    };

    const featuredPosts = useMemo(() => {
        return posts
            .filter(p => p.isFeatured || p.status === 'published')
            .slice(0, 2);
    }, [posts]);

    const regularPosts = useMemo(() => {
        const featuredIds = new Set(featuredPosts.map(p => p._id));
        return filteredPosts.filter(p => !featuredIds.has(p._id));
    }, [filteredPosts, featuredPosts]);

    const totalPosts = posts.length;

    return (
        <div className="blog-page">
            {/* Hero Section */}
            <section className="blog-hero">
                <div className="container">
                    <div className="blog-hero-content">
                        <div className="blog-hero-badge">
                            <i className="bi bi-stars"></i>
                            Góc kiến thức MajorGuide
                        </div>
                        <h1 className="blog-hero-title">
                            Kiến thức cho hành trình<br /><span>chọn đúng tương lai</span>
                        </h1>
                        <p className="blog-hero-subtitle">
                            Góc nhìn thực tế từ chuyên gia về hướng nghiệp, tuyển sinh và những kỹ năng cần thiết để bạn tự tin trước mỗi lựa chọn.
                        </p>
                        <div className="blog-hero-stats">
                            <div className="blog-stat-item">
                                <i className="bi bi-file-earmark-text"></i>
                                <span><strong>{totalPosts}</strong> bài viết</span>
                            </div>
                            <div className="blog-stat-divider"></div>
                            <div className="blog-stat-item">
                                <i className="bi bi-people"></i>
                                <span>Chuyên gia tư vấn</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Filter Bar */}
            <section className="blog-filters">
                <div className="container">
                    <div className="blog-filter-bar">
                        <div className="blog-search-box">
                            <i className="bi bi-search"></i>
                            <input
                                type="text"
                                placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="blog-search-input"
                            />
                            {searchTerm && (
                                <button className="blog-search-clear" onClick={() => setSearchTerm('')}>
                                    <i className="bi bi-x"></i>
                                </button>
                            )}
                        </div>
                        <div className="blog-sort-box">
                            <label>
                                <i className="bi bi-arrow-down-up"></i>
                                Sắp xếp:
                            </label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="blog-sort-select"
                            >
                                <option value="newest">Mới nhất</option>
                                <option value="oldest">Cũ nhất</option>
                                <option value="title_asc">A → Z</option>
                                <option value="title_desc">Z → A</option>
                            </select>
                        </div>
                    </div>

                    {searchTerm && (
                        <div className="blog-search-result">
                            <i className="bi bi-info-circle"></i>
                            Tìm thấy <strong>{filteredPosts.length}</strong> bài viết cho từ khóa <strong>"{searchTerm}"</strong>
                        </div>
                    )}
                </div>
            </section>

            {/* Posts Grid */}
            <section className="blog-content">
                <div className="container">
                    {loading ? (
                        <div className="blog-loading">
                            <div className="blog-spinner"></div>
                            <span>Đang tải bài viết...</span>
                        </div>
                    ) : filteredPosts.length === 0 && !searchTerm ? (
                        <div className="blog-empty">
                            <div className="blog-empty-icon">
                                <i className="bi bi-journal-x"></i>
                            </div>
                            <h3>Chưa có bài viết nào</h3>
                            <p>Hãy quay lại sau để cập nhật những bài viết mới nhất từ đội ngũ chuyên gia.</p>
                        </div>
                    ) : filteredPosts.length === 0 && searchTerm ? (
                        <div className="blog-empty">
                            <div className="blog-empty-icon">
                                <i className="bi bi-search"></i>
                            </div>
                            <h3>Không tìm thấy bài viết nào</h3>
                            <p>Thử tìm kiếm với từ khóa khác.</p>
                            <button className="blog-btn-clear" onClick={() => setSearchTerm('')}>
                                <i className="bi bi-arrow-counterclockwise"></i>
                                Xóa tìm kiếm
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Featured Posts (only on first page load) */}
                            {!searchTerm && featuredPosts.length > 0 && (
                                <div className="blog-section">
                                    <h2 className="blog-section-title">
                                        <i className="bi bi-star-fill"></i>
                                        Bài viết nổi bật
                                    </h2>
                                    <div className="blog-featured-grid">
                                        {featuredPosts.map((post) => (
                                            <Link key={post._id} to={`/blog/${post._id}`} className="blog-featured-card">
                                                <div className="blog-featured-image">
                                                    <img
                                                        src={post.imageUrl || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&q=80'}
                                                        alt={post.title}
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800&q=80';
                                                        }}
                                                    />
                                                    <div className="blog-featured-overlay">
                                                        <div className="blog-featured-tag">
                                                            <i className="bi bi-star-fill"></i>
                                                            Nổi bật
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="blog-featured-body">
                                                    <div className="blog-featured-meta">
                                                        <span className="blog-meta-date">
                                                            <i className="bi bi-calendar3"></i>
                                                            {formatDate(post.createdAt)}
                                                        </span>
                                                        {post.expertId && (
                                                            <span className="blog-meta-author">
                                                                <i className="bi bi-person"></i>
                                                                {post.expertId.fullName || post.expertId.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="blog-featured-title">{post.title}</h3>
                                                    <p className="blog-featured-excerpt">
                                                        {renderExcerpt(post.content, 180)}
                                                    </p>
                                                    <div className="blog-featured-footer">
                                                        <span className="blog-read-more">
                                                            Đọc bài viết
                                                            <i className="bi bi-arrow-right"></i>
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Regular Posts */}
                            {regularPosts.length > 0 && (
                                <div className="blog-section">
                                    {!searchTerm && featuredPosts.length > 0 && (
                                        <h2 className="blog-section-title">
                                            <i className="bi bi-journal-text"></i>
                                            Tất cả bài viết
                                        </h2>
                                    )}
                                    <div className="blog-grid">
                                        {regularPosts.map((post) => (
                                            <Link key={post._id} to={`/blog/${post._id}`} className="blog-card">
                                                <div className="blog-card-image">
                                                    <img
                                                        src={post.imageUrl || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=400&q=80'}
                                                        alt={post.title}
                                                        onError={(e) => {
                                                            e.target.src = 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=400&q=80';
                                                        }}
                                                    />
                                                    <div className="blog-card-image-overlay">
                                                        <div className="blog-card-hover-content">
                                                            <i className="bi bi-book"></i>
                                                            Đọc bài
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="blog-card-body">
                                                    <div className="blog-card-meta-top">
                                                        <span className="blog-card-date">
                                                            <i className="bi bi-calendar3"></i>
                                                            {formatDateShort(post.createdAt)}
                                                        </span>
                                                        {post.expertId && (
                                                            <span className="blog-card-author">
                                                                <i className="bi bi-person"></i>
                                                                {post.expertId.fullName || post.expertId.name}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <h3 className="blog-card-title">{post.title}</h3>
                                                    <p className="blog-card-excerpt">
                                                        {renderExcerpt(post.content, 100)}
                                                    </p>
                                                    <div className="blog-card-footer">
                                                        <span className="blog-card-read">
                                                            <i className="bi bi-book"></i>
                                                            Đọc bài viết
                                                        </span>
                                                        <span className="blog-card-arrow">
                                                            <i className="bi bi-arrow-right"></i>
                                                        </span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>

            {/* Newsletter CTA */}
            <section className="blog-cta">
                <div className="container">
                    <div className="blog-cta-card">
                        <div className="blog-cta-icon">
                            <i className="bi bi-envelope-paper-heart"></i>
                        </div>
                        <div className="blog-cta-content">
                            <h3>Bạn cần tư vấn chuyên sâu?</h3>
                            <p>Đặt lịch hẹn với chuyên gia của MajorGuide để được hỗ trợ riêng biệt.</p>
                        </div>
                        <Link to="/experts" className="blog-cta-btn">
                            <i className="bi bi-calendar-check"></i>
                            Đặt lịch tư vấn
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default BlogPage;
