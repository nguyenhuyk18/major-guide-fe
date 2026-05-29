import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { createPost, updatePost, getPostById } from '../../services/post.api';
import RichTextEditor from '../../components/RichTextEditor';
import '../../assets/css/PostFormPage.css';

const toSlug = (str) => {
    if (!str) return '';
    return str
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
};

export default function PostFormPage() {
    const navigate = useNavigate();
    const { id } = useParams();
    const adminInfo = useSelector(state => state.authAdminReducer.loggedUser);
    const isEditMode = Boolean(id);
    const isExpert = adminInfo?.role_name === 'expert';
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (adminInfo && !isExpert) {
            toast.error('Bạn không có quyền tạo hoặc chỉnh sửa bài viết!');
            navigate('/admin/posts');
        }
    }, [adminInfo, isExpert, navigate]);

    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(isEditMode);
    const [previewImage, setPreviewImage] = useState(null);
    const [isDragging, setIsDragging] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        content: '',
        file: null,
    });

    const [errors, setErrors] = useState({});

    const fetchPostData = useCallback(async () => {
        setLoadingData(true);
        try {
            const res = await getPostById(id);
            if (res?.data?.data) {
                const post = res.data.data;
                setFormData({
                    title: post.title || '',
                    content: post.content || '',
                    file: null,
                });
                if (post.imageUrl) {
                    setPreviewImage(post.imageUrl);
                }
            }
        } catch (error) {
            console.error('Error fetching post:', error);
            toast.error('Không thể tải thông tin bài viết!');
            navigate('/admin/posts');
        } finally {
            setLoadingData(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        if (isEditMode && id) {
            fetchPostData();
        }
    }, [id, isEditMode, fetchPostData]);

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
        if (field === 'title') {
            setFormData(prev => ({ ...prev, slug: toSlug(value) }));
        }
    };

    const handleFileChange = (file) => {
        if (!file) return;
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            toast.error('Chỉ chấp nhận file ảnh (jpg, jpeg, png, gif, webp)!');
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            toast.error('Kích thước file không được vượt quá 10MB!');
            return;
        }
        setFormData(prev => ({ ...prev, file }));
        setPreviewImage(URL.createObjectURL(file));
        if (errors.file) {
            setErrors(prev => ({ ...prev, file: '' }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    };

    const removeImage = () => {
        setFormData(prev => ({ ...prev, file: null }));
        setPreviewImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Vui lòng nhập tiêu đề bài viết!';
        if (!formData.content.trim() || formData.content === '<p></p>') {
            newErrors.content = 'Vui lòng nhập nội dung bài viết!';
        }
        if (!isEditMode && !formData.file && !previewImage) {
            newErrors.file = 'Vui lòng chọn ảnh bìa bài viết!';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            toast.error('Vui lòng điền đầy đủ thông tin bắt buộc!');
            return;
        }

        setLoading(true);
        try {
            const data = new FormData();
            data.append('title', formData.title.trim());
            data.append('content', formData.content.trim());
            if (formData.file) data.append('file', formData.file);

            if (isEditMode) {
                await updatePost(id, data);
                toast.success('Cập nhật bài viết thành công!');
            } else {
                await createPost(data);
                toast.success('Tạo bài viết thành công!');
            }
            navigate('/admin/posts');
        } catch (error) {
            console.error('Error saving post:', error);
            toast.error(error?.response?.data?.message || 'Lưu bài viết thất bại!');
        } finally {
            setLoading(false);
        }
    };

    if (loadingData) {
        return (
            <div className="post-form-page">
                <div className="post-form-loading">
                    <div className="post-form-spinner"></div>
                    <span>Đang tải thông tin bài viết...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="post-form-page">
            {/* Header */}
            <div className="post-form-topbar">
                <div className="post-form-topbar-left">
                    <button className="post-form-back-btn" onClick={() => navigate('/admin/posts')}>
                        <i className="bi bi-arrow-left"></i>
                    </button>
                    <div>
                        <h1 className="post-form-page-title">
                            <i className="bi bi-pencil-square"></i>
                            {isEditMode ? 'Chỉnh sửa bài viết' : 'Tạo bài viết mới'}
                        </h1>
                        <p className="post-form-page-subtitle">
                            {isEditMode
                                ? 'Cập nhật nội dung và hình ảnh bài viết'
                                : 'Viết và xuất bản bài viết của bạn'}
                        </p>
                    </div>
                </div>
                <div className="post-form-topbar-actions">
                    <button
                        type="button"
                        className="btn-cancel-post"
                        onClick={() => navigate('/admin/posts')}
                    >
                        <i className="bi bi-x-lg"></i>
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        form="post-main-form"
                        className="btn-submit-post"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <div className="btn-spinner"></div>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <i className="bi bi-check-lg"></i>
                                {isEditMode ? 'Cập nhật bài viết' : 'Đăng bài viết'}
                            </>
                        )}
                    </button>
                </div>
            </div>

            <form id="post-main-form" onSubmit={handleSubmit} className="post-form-layout">
                {/* Main Content Column */}
                <div className="post-form-main">
                    {/* Title */}
                    <div className="post-form-card">
                        <div className="post-form-card-body">
                            <input
                                type="text"
                                name="title"
                                className={`post-title-input ${errors.title ? 'is-invalid' : ''}`}
                                placeholder="Nhập tiêu đề bài viết của bạn..."
                                value={formData.title}
                                onChange={(e) => handleChange('title', e.target.value)}
                                maxLength={200}
                            />
                            {errors.title && <span className="field-error">{errors.title}</span>}

                            <div className="post-title-meta">
                                <span className="char-count">
                                    <i className="bi bi-text-left"></i>
                                    {formData.title.length}/200 ký tự
                                </span>
                                <span className="slug-preview">
                                    <i className="bi bi-link-45deg"></i>
                                    slug: <code>{toSlug(formData.title) || 'tu-de-bai-viet'}</code>
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Content Editor */}
                    <div className="post-form-card">
                        <div className="post-form-card-header">
                            <h3 className="post-form-card-title">
                                <i className="bi bi-file-earmark-text"></i>
                                Nội dung bài viết
                            </h3>
                            <p className="post-form-card-desc">
                                Sử dụng thanh công cụ để định dạng văn bản, thêm tiêu đề, danh sách, hình ảnh...
                            </p>
                        </div>
                        <div className="post-form-card-body">
                            <RichTextEditor
                                value={formData.content}
                                onChange={(html) => handleChange('content', html)}
                                placeholder="Bắt đầu viết nội dung bài viết của bạn ở đây..."
                                error={errors.content}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar Column */}
                <div className="post-form-sidebar">
                    {/* Cover Image */}
                    <div className="post-form-card">
                        <div className="post-form-card-header">
                            <h3 className="post-form-card-title">
                                <i className="bi bi-image"></i>
                                Ảnh bìa bài viết
                            </h3>
                        </div>
                        <div className="post-form-card-body">
                            {!previewImage ? (
                                <div
                                    className={`image-upload-zone ${isDragging ? 'dragging' : ''} ${errors.file ? 'has-error' : ''}`}
                                    onDragOver={handleDragOver}
                                    onDragLeave={handleDragLeave}
                                    onDrop={handleDrop}
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileChange(e.target.files[0])}
                                    />
                                    <div className="upload-zone-icon">
                                        <i className="bi bi-cloud-arrow-up"></i>
                                    </div>
                                    <p className="upload-zone-text">Kéo thả ảnh vào đây hoặc nhấn để chọn</p>
                                    <span className="upload-zone-hint">JPG, PNG, GIF, WEBP - Tối đa 10MB</span>
                                </div>
                            ) : (
                                <div className="image-preview-wrapper">
                                    <img src={previewImage} alt="Preview" className="image-preview-img" />
                                    <div className="image-preview-overlay">
                                        <button
                                            type="button"
                                            className="btn-change-image"
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <i className="bi bi-pencil"></i>
                                            Đổi ảnh
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-remove-image"
                                            onClick={removeImage}
                                        >
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                                        style={{ display: 'none' }}
                                        onChange={(e) => handleFileChange(e.target.files[0])}
                                    />
                                </div>
                            )}
                            {errors.file && <span className="field-error">{errors.file}</span>}
                        </div>
                    </div>

                    {/* Author Info */}
                    <div className="post-form-card">
                        <div className="post-form-card-header">
                            <h3 className="post-form-card-title">
                                <i className="bi bi-person-badge"></i>
                                Thông tin tác giả
                            </h3>
                        </div>
                        <div className="post-form-card-body">
                            <div className="author-info-box">
                                <div className="author-avatar">
                                    {adminInfo?.fileAvartarUrl ? (
                                        <img src={adminInfo.fileAvartarUrl} alt={adminInfo.name} />
                                    ) : (
                                        <span>{adminInfo?.name?.charAt(0)?.toUpperCase() || 'E'}</span>
                                    )}
                                </div>
                                <div className="author-details">
                                    <span className="author-name">{adminInfo?.name || 'Chuyên gia'}</span>
                                    <span className="author-role">
                                        <i className="bi bi-shield-check"></i>
                                        {adminInfo?.role_name === 'expert' ? 'Chuyên gia' : 'Quản trị viên'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Writing Tips */}
                    <div className="post-form-card tips-card">
                        <div className="post-form-card-header">
                            <h3 className="post-form-card-title">
                                <i className="bi bi-lightbulb"></i>
                                Mẹo viết bài
                            </h3>
                        </div>
                        <div className="post-form-card-body">
                            <ul className="tips-list">
                                <li>
                                    <i className="bi bi-check-circle"></i>
                                    Tiêu đề ngắn gọn, hấp dẫn
                                </li>
                                <li>
                                    <i className="bi bi-check-circle"></i>
                                    Nội dung có cấu trúc rõ ràng
                                </li>
                                <li>
                                    <i className="bi bi-check-circle"></i>
                                    Sử dụng hình ảnh minh họa phù hợp
                                </li>
                                <li>
                                    <i className="bi bi-check-circle"></i>
                                    Chia thành nhiều đoạn ngắn
                                </li>
                                <li>
                                    <i className="bi bi-check-circle"></i>
                                    Dùng tiêu đề phụ để phân cấp
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
