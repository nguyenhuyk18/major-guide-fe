import React, { useEffect, useState } from 'react';
import '../../assets/css/HomePage.css'
import HeroSection from '../../components/client/HeroSection';
import ChatCommunity from '../../components/client/ChatCommunity';
import { Link } from 'react-router-dom';
import { getAllPosts } from '../../services/post.api';
import { getListUser } from '../../services/user-access.api';


export default function HomePage() {
    const [recentPosts, setRecentPosts] = useState([]);
    const [experts, setExperts] = useState([]);
    const [loadingExperts, setLoadingExperts] = useState(true);

    useEffect(() => {
        fetchRecentPosts();
        fetchExperts();
    }, []);

    const fetchRecentPosts = async () => {
        try {
            const res = await getAllPosts();
            // Cấu trúc: res.data.data.posts
            const posts = res?.data?.data?.posts || res?.data?.data?.result || res?.data?.data || [];
            // Hiển thị tối đa 4 bài viết
            setRecentPosts(Array.isArray(posts) ? posts.slice(0, 4) : []);
        } catch (error) {
            console.error('Error fetching posts:', error);
        }
    };

    const fetchExperts = async () => {
        setLoadingExperts(true);
        try {
            const res = await getListUser('', '', '', 4, '', 'expert');
            if (res?.data?.data?.result) {
                // Lấy 4 chuyên gia đầu tiên
                setExperts(res.data.data.result.slice(0, 4));
            } else if (Array.isArray(res?.data?.data)) {
                // Fallback: data directly is an array
                setExperts(res.data.data.slice(0, 4));
            }
        } catch (error) {
            console.error('Error fetching experts:', error);
        } finally {
            setLoadingExperts(false);
        }
    };

    const getExpertAvatar = (expert) => {
        if (expert.fileAvartarUrl) {
            return expert.fileAvartarUrl;
        }
        const initial = expert.name ? expert.name.charAt(0).toUpperCase() : 'E';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=6366f1&color=fff&size=150`;
    };

    const getExpertMajor = (expert) => {
        if (expert.expertProfile?.major) {
            return expert.expertProfile.major;
        }
        if (expert.roleName === 'expert' && expert.expertProfile) {
            return 'Chuyên gia tư vấn';
        }
        return 'Chuyên gia tư vấn';
    };

    return (
        <>
            <div className="client-home-page">

                <HeroSection />



                {/* Featured Experts Section */}
                <section className="client-experts-section">
                    <div className="container">
                        <div className="client-section-header">
                            <h2 className="client-section-title">Chuyên gia nổi bật</h2>
                            <p className="client-section-subtitle">Đội ngũ chuyên gia giàu kinh nghiệm, tận tâm hỗ trợ bạn tuyển sinh đại học</p>
                            <Link to="/experts" className="client-link-view-all">
                                Xem tất cả <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>

                        {loadingExperts ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status"></div>
                            </div>
                        ) : experts.length > 0 ? (
                            <div className="row g-4">
                                {experts.map((expert, index) => (
                                    <div key={expert.id || expert._id || index} className="col-12 col-sm-6 col-lg-3">
                                        <div className="client-expert-card">
                                            <div className="client-expert-avatar-wrapper">
                                                <img
                                                    src={getExpertAvatar(expert)}
                                                    alt={expert.name}
                                                    className="client-expert-avatar"
                                                    onError={(e) => {
                                                        const initial = expert.name ? expert.name.charAt(0).toUpperCase() : 'E';
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(initial)}&background=6366f1&color=fff&size=150`;
                                                    }}
                                                />
                                                <span className="client-expert-status"></span>
                                            </div>
                                            <h3 className="client-expert-name">{expert.name || 'Chuyên gia'}</h3>
                                            <p className="client-expert-major">{getExpertMajor(expert)}</p>
                                            <div className="client-expert-rating">
                                                <i className="bi bi-star-fill"></i>
                                                <span>4.5</span>
                                                <span className="client-expert-reviews">(3.4k đánh giá)</span>
                                            </div>
                                            <p className="client-expert-bio">
                                                {expert.expertProfile?.information
                                                    ? expert.expertProfile.information.substring(0, 60) + '...'
                                                    : 'Chuyên gia tư vấn tuyển sinh hàng đầu, sẵn sàng hỗ trợ bạn 24/7.'}
                                            </p>
                                            <Link
                                                to={`/choose-schedule?expert_id=${expert.id || expert._id}`}
                                                className="client-btn-expert"
                                            >
                                                <i className="bi bi-calendar me-2"></i>
                                                Đặt lịch hẹn
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <p className="text-muted">Chưa có chuyên gia nào.</p>
                            </div>
                        )}
                    </div>
                </section>

                {/* Universities and Majors Section */}


                {/* Recent Articles Section */}
                <section className="client-section" style={{ background: '#f8fafc' }}>
                    <div className="container">
                        <div className="client-section-header">
                            <h2 className="client-section-title">Bài viết gần đây</h2>
                            <p className="client-section-subtitle">Cập nhật tin tức và kiến thức tuyển sinh mới nhất</p>
                            <Link to="/blog" className="client-link-view-all">
                                Xem tất cả <i className="bi bi-arrow-right"></i>
                            </Link>
                        </div>
                        <div className="row g-4">
                            {recentPosts.length > 0 ? (
                                recentPosts.map((post) => (
                                    <div key={post._id || post.id} className="col-12 col-sm-6 col-lg-3">
                                        <div className="client-article-card">
                                            <div className="client-article-image">
                                                <img
                                                    src={post.imageUrl || post.thumbnailUrl || post.coverImage || 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'}
                                                    alt={post.title}
                                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&h=400&fit=crop'; }}
                                                />
                                                <span className="client-article-badge">Blog</span>
                                            </div>
                                            <div className="client-article-content">
                                                <p className="client-article-date">
                                                    <i className="bi bi-calendar3"></i>
                                                    {post.createdAt ? new Date(post.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : ''}
                                                </p>
                                                <h3 className="client-article-title">{post.title}</h3>
                                                {post.description && (
                                                    <p className="client-article-excerpt">
                                                        {post.description.length > 100 ? post.description.substring(0, 100) + '...' : post.description}
                                                    </p>
                                                )}
                                                {post.content && !post.description && (
                                                    <p className="client-article-excerpt">
                                                        {post.content.length > 100 ? post.content.substring(0, 100) + '...' : post.content}
                                                    </p>
                                                )}
                                                <Link to={`/blog/${post.id || post._id}`} className="client-article-read-more">
                                                    Đọc thêm <i className="bi bi-arrow-right"></i>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="col-12 text-center py-5">
                                    <div style={{ color: '#94a3b8' }}>
                                        <i className="bi bi-newspaper" style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}></i>
                                        <p>Chưa có bài viết nào.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Discussion Forum Section */}
                <ChatCommunity />
            </div>
        </>
    );
}
