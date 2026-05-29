import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getAllPosts, getPostsByExpert, deletePost } from '../../services/post.api';
import '../../assets/css/PostManagePage.css';

const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
};

const formatNumber = (num) => {
    if (!num && num !== 0) return 0;
    return num.toLocaleString('vi-VN');
};

const PostManagePage = () => {
    // const navigate = useNavigate();
    const adminInfo = useSelector(state => state.authAdminReducer.loggedUser);
    const [posts, setPosts] = useState([]);
    const [filteredPosts, setFilteredPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [deleteModal, setDeleteModal] = useState({ show: false, post: null });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('all');
    const [viewMode, setViewMode] = useState('grid');
    // const [selectedPost, setSelectedPost] = useState(null);
    const [detailModal, setDetailModal] = useState({ show: false, post: null });

    const isAdmin = adminInfo?.role_name === 'admin';
    const isExpert = adminInfo?.role_name === 'expert';

    const fetchPosts = useCallback(async () => {
        setLoading(true);
        try {
            let res;

            if (isAdmin) {
                res = await getAllPosts();
            } else {

                res = await getPostsByExpert(adminInfo.id);
                console.log('data', res);
            }
            if (res?.data?.posts) {
                const data = res.data.posts;
                console.log('data', data);
                setPosts(Array.isArray(data) ? data : []);
            }


            // console.log('posts', posts);
        } catch (error) {
            console.error('Error fetching posts:', error);
            toast.error('Không thể tải danh sách bài viết!');
        } finally {
            setLoading(false);
        }
    }, [isAdmin, adminInfo?.id]);

    const filterPosts = useCallback(() => {
        let result = [...posts];
        if (searchTerm.trim()) {
            const term = searchTerm.toLowerCase();
            result = result.filter(p =>
                (p.title && p.title.toLowerCase().includes(term)) ||
                (p.content && p.content.toLowerCase().includes(term))
            );
        }
        if (activeTab !== 'all') {
            result = result.filter(p => p.status === activeTab);
        }
        setFilteredPosts(result);
    }, [posts, searchTerm, activeTab]);

    useEffect(() => {
        if (adminInfo?.id) {
            fetchPosts();
        }
    }, [adminInfo, fetchPosts]);

    useEffect(() => {
        filterPosts();
    }, [posts, searchTerm, activeTab, filterPosts]);

    const handleDeleteClick = (post) => {
        setDeleteModal({ show: true, post });
    };

    const handleConfirmDelete = async () => {
        if (!deleteModal.post?._id) return;
        try {
            await deletePost(deleteModal.post._id);
            toast.success('Xóa bài viết thành công!');
            setPosts(prev => prev.filter(p => p._id !== deleteModal.post._id));
        } catch (error) {
            console.error('Error deleting post:', error);
            toast.error('Xóa bài viết thất bại!');
        } finally {
            setDeleteModal({ show: false, post: null });
        }
    };

    const handleViewDetail = (post) => {
        setDetailModal({ show: true, post });
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'published': return 'Đã đăng';
            case 'draft': return 'Bản nháp';
            case 'archived': return 'Lưu trữ';
            default: return status;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'published': return 'status-published';
            case 'draft': return 'status-draft';
            case 'archived': return 'status-archived';
            default: return 'status-draft';
        }
    };

    const publishedCount = posts.filter(p => p.status === 'published').length;
    const draftCount = posts.filter(p => p.status === 'draft').length;
    const archivedCount = posts.filter(p => p.status === 'archived').length;

    const stats = [
        { key: 'all', label: 'Tất cả', count: posts.length, icon: 'bi-collection', color: '#667eea' },
        { key: 'published', label: 'Đã đăng', count: publishedCount, icon: 'bi-check-circle', color: '#10b981' },
        { key: 'draft', label: 'Bản nháp', count: draftCount, icon: 'bi-file-earmark', color: '#9ca3af' },
        { key: 'archived', label: 'Lưu trữ', count: archivedCount, icon: 'bi-archive', color: '#ef4444' },
    ];

    const renderContent = (html) => {
        if (!html) return '';
        const div = document.createElement('div');
        div.innerHTML = html;
        return div.textContent || div.innerText || '';
    };

    return (
        <div className="pmp-page">
            {/* Page Header */}
            <div className="pmp-header">
                <div className="pmp-header-left">
                    <div className="pmp-title-group">
                        <h1 className="pmp-title">
                            <i className="bi bi-file-post"></i>
                            Bài viết
                        </h1>
                        <p className="pmp-subtitle">
                            {isAdmin
                                ? 'Quản lý tất cả bài viết từ đội ngũ chuyên gia'
                                : 'Quản lý các bài viết của bạn'}
                        </p>
                    </div>
                    {isExpert && (
                        <Link to="/admin/posts/create" className="pmp-btn-primary">
                            <i className="bi bi-plus-lg"></i>
                            Viết bài mới
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="pmp-stats">
                {stats.map(stat => (
                    <div
                        key={stat.key}
                        className={`pmp-stat-card ${activeTab === stat.key ? 'active' : ''}`}
                        onClick={() => setActiveTab(stat.key)}
                        style={{ '--stat-color': stat.color }}
                    >
                        <div className="pmp-stat-icon">
                            <i className={`bi ${stat.icon}`}></i>
                        </div>
                        <div className="pmp-stat-info">
                            <span className="pmp-stat-count">{stat.count}</span>
                            <span className="pmp-stat-label">{stat.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Search & Controls */}
            <div className="pmp-controls">
                <div className="pmp-search-box">
                    <i className="bi bi-search"></i>
                    <input
                        type="text"
                        placeholder="Tìm kiếm bài viết theo tiêu đề, nội dung..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {searchTerm && (
                        <button className="pmp-search-clear" onClick={() => setSearchTerm('')}>
                            <i className="bi bi-x"></i>
                        </button>
                    )}
                </div>
                <div className="pmp-view-toggle">
                    <button
                        className={`pmp-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        onClick={() => setViewMode('grid')}
                        title="Chế độ lưới"
                    >
                        <i className="bi bi-grid-3x3-gap"></i>
                    </button>
                    <button
                        className={`pmp-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                        onClick={() => setViewMode('list')}
                        title="Chế độ danh sách"
                    >
                        <i className="bi bi-list-ul"></i>
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="pmp-content">
                {loading ? (
                    <div className="pmp-loading">
                        <div className="pmp-spinner"></div>
                        <span>Đang tải bài viết...</span>
                    </div>
                ) : filteredPosts.length === 0 ? (
                    <div className="pmp-empty">
                        <div className="pmp-empty-icon">
                            <i className="bi bi-journal-x"></i>
                        </div>
                        <h3>
                            {posts.length === 0
                                ? 'Chưa có bài viết nào'
                                : 'Không tìm thấy bài viết phù hợp'}
                        </h3>
                        <p>
                            {posts.length === 0 && isExpert
                                ? 'Bắt đầu viết bài viết đầu tiên của bạn ngay!'
                                : 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc.'}
                        </p>
                        {posts.length === 0 && isExpert && (
                            <Link to="/admin/posts/create" className="pmp-btn-primary">
                                <i className="bi bi-plus-lg"></i>
                                Viết bài mới
                            </Link>
                        )}
                        {posts.length > 0 && (
                            <button className="pmp-btn-secondary" onClick={() => { setSearchTerm(''); setActiveTab('all'); }}>
                                <i className="bi bi-arrow-counterclockwise"></i>
                                Xóa bộ lọc
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        {viewMode === 'grid' ? (
                            <div className="pmp-grid">
                                {filteredPosts.map((post) => (
                                    <div key={post._id} className="pmp-card">
                                        <div className="pmp-card-image" onClick={() => handleViewDetail(post)}>
                                            <img
                                                src={post.imageUrl || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600&q=80'}
                                                alt={post.title}
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=600&q=80';
                                                }}
                                            />
                                            <div className="pmp-card-image-overlay">
                                                <i className="bi bi-eye"></i>
                                            </div>
                                        </div>
                                        <div className="pmp-card-body">
                                            <div className="pmp-card-meta">
                                                <span className={`pmp-status-badge ${getStatusClass(post.status)}`}>
                                                    {getStatusLabel(post.status)}
                                                </span>
                                                <span className="pmp-card-date">
                                                    <i className="bi bi-calendar3"></i>
                                                    {formatDate(post.createdAt)}
                                                </span>
                                            </div>
                                            <h3 className="pmp-card-title" onClick={() => handleViewDetail(post)}>
                                                {post.title}
                                            </h3>
                                            <p className="pmp-card-excerpt">
                                                {renderContent(post.content).substring(0, 120)}...
                                            </p>
                                            <div className="pmp-card-footer">
                                                <div className="pmp-card-stats">
                                                    <span className="pmp-stat-item">
                                                        <i className="bi bi-eye"></i>
                                                        {formatNumber(post.viewCount || 0)}
                                                    </span>
                                                </div>
                                                <div className="pmp-card-actions">
                                                    <button
                                                        className="pmp-action-btn pmp-action-view"
                                                        onClick={() => handleViewDetail(post)}
                                                        title="Xem chi tiết"
                                                    >
                                                        <i className="bi bi-eye"></i>
                                                    </button>
                                                    {isExpert && (
                                                        <Link
                                                            to={`/admin/posts/edit/${post._id}`}
                                                            className="pmp-action-btn pmp-action-edit"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <i className="bi bi-pencil"></i>
                                                        </Link>
                                                    )}
                                                    <button
                                                        className="pmp-action-btn pmp-action-delete"
                                                        onClick={() => handleDeleteClick(post)}
                                                        title="Xóa"
                                                    >
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="pmp-list">
                                {filteredPosts.map((post) => (
                                    <div key={post._id} className="pmp-list-item" onClick={() => handleViewDetail(post)}>
                                        <div className="pmp-list-image">
                                            <img
                                                src={post.imageUrl || 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=200&q=80'}
                                                alt={post.title}
                                                onError={(e) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=200&q=80';
                                                }}
                                            />
                                        </div>
                                        <div className="pmp-list-info">
                                            <h3 className="pmp-list-title">{post.title}</h3>
                                            <p className="pmp-list-excerpt">
                                                {renderContent(post.content).substring(0, 150)}...
                                            </p>
                                            <div className="pmp-list-meta">
                                                <span className={`pmp-status-badge ${getStatusClass(post.status)}`}>
                                                    {getStatusLabel(post.status)}
                                                </span>
                                                <span className="pmp-meta-item">
                                                    <i className="bi bi-calendar3"></i>
                                                    {formatDate(post.createdAt)}
                                                </span>
                                                <span className="pmp-meta-item">
                                                    <i className="bi bi-eye"></i>
                                                    {formatNumber(post.viewCount || 0)} lượt xem
                                                </span>
                                                {isAdmin && (
                                                    <span className="pmp-meta-item">
                                                        <i className="bi bi-person"></i>
                                                        {post.expertId?.fullName || post.expertId?.name || 'N/A'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="pmp-list-actions" onClick={(e) => e.stopPropagation()}>
                                            {isExpert && (
                                                <Link
                                                    to={`/admin/posts/edit/${post._id}`}
                                                    className="pmp-action-btn pmp-action-edit"
                                                    title="Chỉnh sửa"
                                                >
                                                    <i className="bi bi-pencil"></i>
                                                </Link>
                                            )}
                                            <button
                                                className="pmp-action-btn pmp-action-delete"
                                                onClick={() => handleDeleteClick(post)}
                                                title="Xóa"
                                            >
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Delete Modal */}
            {deleteModal.show && (
                <div className="pmp-modal-overlay" onClick={(e) => e.target === e.currentTarget && setDeleteModal({ show: false, post: null })}>
                    <div className="pmp-modal-container">
                        <div className="pmp-modal-icon pmp-modal-icon-danger">
                            <i className="bi bi-exclamation-triangle"></i>
                        </div>
                        <h3 className="pmp-modal-title">Xác nhận xóa bài viết</h3>
                        <p className="pmp-modal-message">
                            Bạn có chắc chắn muốn xóa bài viết <strong>"{deleteModal.post?.title}"</strong>?<br />
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="pmp-modal-actions">
                            <button className="pmp-btn-secondary" onClick={() => setDeleteModal({ show: false, post: null })}>
                                <i className="bi bi-x-lg"></i>
                                Hủy bỏ
                            </button>
                            <button className="pmp-btn-danger" onClick={handleConfirmDelete}>
                                <i className="bi bi-trash"></i>
                                Xóa bài viết
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {detailModal.show && detailModal.post && (
                <div className="pmp-modal-overlay" onClick={(e) => e.target === e.currentTarget && setDetailModal({ show: false, post: null })}>
                    <div className="pmp-modal-container pmp-modal-large">
                        <button className="pmp-modal-close" onClick={() => setDetailModal({ show: false, post: null })}>
                            <i className="bi bi-x-lg"></i>
                        </button>
                        {detailModal.post.imageUrl && (
                            <div className="pmp-detail-image">
                                <img src={detailModal.post.imageUrl} alt={detailModal.post.title} />
                            </div>
                        )}
                        <div className="pmp-detail-header">
                            <span className={`pmp-status-badge ${getStatusClass(detailModal.post.status)}`}>
                                {getStatusLabel(detailModal.post.status)}
                            </span>
                            <span className="pmp-detail-date">
                                <i className="bi bi-calendar3"></i>
                                {formatDate(detailModal.post.createdAt)}
                            </span>
                            <span className="pmp-detail-views">
                                <i className="bi bi-eye"></i>
                                {formatNumber(detailModal.post.viewCount || 0)} lượt xem
                            </span>
                        </div>
                        <h2 className="pmp-detail-title">{detailModal.post.title}</h2>
                        <div
                            className="pmp-detail-content"
                            dangerouslySetInnerHTML={{ __html: detailModal.post.content }}
                        />
                        <div className="pmp-modal-actions">
                            {isExpert && (
                                <Link
                                    to={`/admin/posts/edit/${detailModal.post._id}`}
                                    className="pmp-btn-primary"
                                    onClick={() => setDetailModal({ show: false, post: null })}
                                >
                                    <i className="bi bi-pencil"></i>
                                    Chỉnh sửa
                                </Link>
                            )}
                            <button className="pmp-btn-secondary" onClick={() => setDetailModal({ show: false, post: null })}>
                                <i className="bi bi-x-lg"></i>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostManagePage;
