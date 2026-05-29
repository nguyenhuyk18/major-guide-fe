import React, { useEffect, useState, useRef } from 'react';
import '../../assets/css/ClientInformationPage.css';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import { getUserAccess, updateUserAccess, updateFileAvartar, getProvinceList, getWardByIdProvince, getWardById } from '../../services/user-access.api';
import { UPDATE_LOGGED_USER } from '../../constants/AuthConstant';

export default function ClientInformationPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const { isLogin, loggedUser } = useSelector(state => state.authClientReducer);
    const [currentUser, setCurrentUser] = useState(null);
    const [provinceList, setProvinceList] = useState([]);
    const [wardList, setWardList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        sex: '',
        province_id: '',
        ward_id: '',
        highSchool: '',
    });

    // Check authentication and role
    useEffect(() => {
        if (!isLogin || !loggedUser) {
            toast.error('Vui lòng đăng nhập để xem thông tin cá nhân!');
            navigate('/');
            return;
        }

        if (loggedUser.role_name !== 'member') {
            toast.error('Trang này chỉ dành cho tài khoản thành viên!');
            navigate('/');
            return;
        }
    }, [isLogin, loggedUser, navigate]);

    // Load provinces
    useEffect(() => {
        loadProvinces();
    }, []);

    // Load user data
    useEffect(() => {
        if (loggedUser?.id) {
            fetchUserData(loggedUser.id);
        }
    }, [loggedUser]);

    const loadProvinces = async () => {
        try {
            const rs = await getProvinceList();
            setProvinceList(rs.data.data);
        } catch (error) {
            console.error('Error loading provinces:', error);
        }
    };

    const fetchUserData = async (id) => {
        setIsLoading(true);
        try {
            const res = await getUserAccess(id);
            if (res.data && res.data.data) {
                const userData = res.data.data;
                setCurrentUser(userData);

                // Get ward info to find province
                let provinceId = '';
                if (userData.wardId) {
                    try {
                        const wardInfo = await getWardById(userData.wardId);
                        if (wardInfo?.data?.data?.province_id?.id) {
                            provinceId = wardInfo.data.data.province_id.id;
                            // Load wards for this province
                            const wardsRs = await getWardByIdProvince(provinceId);
                            setWardList(wardsRs.data.data);
                        }
                    } catch (err) {
                        console.error('Error loading ward info:', err);
                    }
                }

                // Split name into firstname and lastname
                const nameParts = (userData.name || '').split(' ');
                const firstname = nameParts.length > 1 ? nameParts.slice(0, -1).join(' ') : '';
                const lastname = nameParts.length > 1 ? nameParts[nameParts.length - 1] : userData.name || '';

                setFormData({
                    firstname: firstname,
                    lastname: lastname,
                    email: userData.email || '',
                    sex: userData.sex || '',
                    province_id: provinceId,
                    ward_id: userData.wardId || '',
                    highSchool: userData.memberProfile?.highSchool || '',
                });
            }
        } catch (error) {
            console.error('Failed to fetch user data', error);
            toast.error('Không thể tải thông tin người dùng!');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formDataFile = new FormData();
        formDataFile.append('file', file);
        setIsUpdatingAvatar(true);

        try {
            const res = await updateFileAvartar(loggedUser.id, formDataFile);
            if (res.data && res.data.data) {
                const newAvatarUrl = res.data.data.data;
                toast.success('Cập nhật ảnh đại diện thành công!');

                // Update Redux state
                dispatch({
                    type: UPDATE_LOGGED_USER,
                    payload: {
                        loggedUser: {
                            ...loggedUser,
                            fileAvartarUrl: newAvatarUrl
                        }
                    }
                });

                // Refetch user data
                fetchUserData(loggedUser.id);
            }
        } catch (error) {
            console.error('Update avatar error', error);
            toast.error('Cập nhật ảnh đại diện thất bại!');
        }
        setIsUpdatingAvatar(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        // When province changes, reset ward
        if (name === 'province_id') {
            setFormData(prev => ({
                ...prev,
                province_id: value,
                ward_id: ''
            }));
            setWardList([]);

            if (value) {
                loadWards(value);
            }
        }
    };

    const loadWards = async (provinceId) => {
        try {
            const rs = await getWardByIdProvince(provinceId);
            setWardList(rs.data.data);
        } catch (error) {
            console.error('Error loading wards:', error);
            toast.error('Lỗi khi tải danh sách phường/xã!');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Combine firstname and lastname
            const fullName = `${formData.firstname} ${formData.lastname}`.trim();

            const dataToUpdate = {
                name: fullName,
                wardId: formData.ward_id,
                memberProfile: {
                    highSchool: formData.highSchool,
                }
            };

            const res = await updateUserAccess(loggedUser.id, dataToUpdate);
            if (res.data) {
                toast.success('Cập nhật thông tin thành công!');

                // Update Redux state
                dispatch({
                    type: UPDATE_LOGGED_USER,
                    payload: {
                        loggedUser: {
                            ...loggedUser,
                            name: fullName
                        }
                    }
                });

                fetchUserData(loggedUser.id);
            }
        } catch (error) {
            console.error('Error updating information:', error);
            toast.error('Cập nhật thông tin thất bại!');
        }
        setIsSubmitting(false);
    };

    const handleReset = () => {
        fetchUserData(loggedUser.id);
    };

    if (isLoading) {
        return (
            <div className="cip-page-wrapper">
                <div className="cip-loading">
                    <div className="cip-spinner"></div>
                    <p className="cip-loading-text">Đang tải thông tin...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cip-page-wrapper">
            <div className="cip-container">
                {/* Breadcrumb */}
                <div className="cip-breadcrumb">
                    <Link to="/" className="cip-breadcrumb-link">Trang chủ</Link>
                    <span className="cip-breadcrumb-separator">/</span>
                    <span className="cip-breadcrumb-current">Thông tin cá nhân</span>
                </div>

                {/* Header Banner */}
                <div className="cip-header-banner">
                    <div className="cip-header-icon">
                        <i className="bi bi-person-vcard"></i>
                    </div>
                    <h1 className="cip-header-title">Hồ sơ cá nhân</h1>
                    <p className="cip-header-subtitle">Quản lý và cập nhật thông tin tài khoản của bạn</p>
                </div>

                {/* Main Content */}
                <div className="cip-main-content">
                    {/* Left Column - Profile Card */}
                    <div className="cip-profile-card">
                        <div className="cip-profile-cover"></div>
                        <div className="cip-profile-body">
                            {/* Avatar */}
                            <div className="cip-avatar-wrapper">
                                <img
                                    src={currentUser?.fileAvartarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.firstname)}+${encodeURIComponent(formData.lastname)}&background=6366f1&color=fff&size=150`}
                                    alt="Avatar"
                                    className="cip-avatar"
                                />
                                <button
                                    className="cip-avatar-edit-btn"
                                    onClick={handleAvatarClick}
                                    disabled={isUpdatingAvatar}
                                    title="Thay đổi ảnh đại diện"
                                >
                                    {isUpdatingAvatar ? (
                                        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                    ) : (
                                        <i className="bi bi-camera"></i>
                                    )}
                                </button>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </div>

                            {/* Name & Role */}
                            <h2 className="cip-profile-name">{formData.firstname} {formData.lastname}</h2>
                            <span className="cip-profile-role">
                                <i className="bi bi-person-badge-fill"></i>
                                Thành viên
                            </span>

                            {/* Profile Info */}
                            <div className="cip-profile-info">
                                <div className="cip-info-item">
                                    <div className="cip-info-icon">
                                        <i className="bi bi-circle-fill"></i>
                                    </div>
                                    <div className="cip-info-content">
                                        <p className="cip-info-label">Trạng thái</p>
                                        <span className={`cip-status-badge ${currentUser?.statusAccount === 'active' ? 'active' : 'inactive'}`}>
                                            <span className="cip-status-dot"></span>
                                            {currentUser?.statusAccount === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                                        </span>
                                    </div>
                                </div>

                                <div className="cip-info-item">
                                    <div className="cip-info-icon">
                                        <i className="bi bi-at"></i>
                                    </div>
                                    <div className="cip-info-content">
                                        <p className="cip-info-label">Username</p>
                                        <p className="cip-info-value truncate">{currentUser?.username || 'N/A'}</p>
                                    </div>
                                </div>

                                <div className="cip-info-item">
                                    <div className="cip-info-icon">
                                        <i className="bi bi-envelope"></i>
                                    </div>
                                    <div className="cip-info-content">
                                        <p className="cip-info-label">Email</p>
                                        <p className="cip-info-value truncate">{currentUser?.email || 'Chưa cập nhật'}</p>
                                    </div>
                                </div>

                                <div className="cip-info-item">
                                    <div className="cip-info-icon">
                                        <i className="bi bi-calendar3"></i>
                                    </div>
                                    <div className="cip-info-content">
                                        <p className="cip-info-label">Ngày tham gia</p>
                                        <p className="cip-info-value">
                                            {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Form Card */}
                    <div className="cip-form-card">
                        <div className="cip-form-header">
                            <div className="cip-form-icon">
                                <i className="bi bi-pencil-square"></i>
                            </div>
                            <div>
                                <h3 className="cip-form-title">Chỉnh sửa thông tin</h3>
                                <p className="cip-form-subtitle">Cập nhật thông tin cá nhân của bạn</p>
                            </div>
                        </div>

                        <div className="cip-form-body">
                            <form onSubmit={handleSubmit}>
                                <div className="cip-form-grid">
                                    {/* Firstname */}
                                    <div className="cip-form-group">
                                        <label className="cip-form-label">
                                            <span className="cip-form-label-text">
                                                <i className="bi bi-person cip-form-label-icon"></i>
                                                Họ
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="firstname"
                                            className="cip-input"
                                            value={formData.firstname}
                                            onChange={handleInputChange}
                                            placeholder="Nhập họ của bạn"
                                        />
                                    </div>

                                    {/* Lastname */}
                                    <div className="cip-form-group">
                                        <label className="cip-form-label">
                                            <span className="cip-form-label-text">
                                                <i className="bi bi-person cip-form-label-icon"></i>
                                                Tên
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="lastname"
                                            className="cip-input"
                                            value={formData.lastname}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên của bạn"
                                        />
                                    </div>

                                    {/* Email */}
                                    <div className="cip-form-group full-width">
                                        <label className="cip-form-label">
                                            <span className="cip-form-label-text">
                                                <i className="bi bi-envelope cip-form-label-icon"></i>
                                                Email
                                            </span>
                                        </label>
                                        <input
                                            type="email"
                                            name="email"
                                            className="cip-input"
                                            value={formData.email}
                                            disabled
                                            placeholder="Email không thể thay đổi"
                                        />
                                        <p className="cip-input-note">Email liên kết với tài khoản, không thể thay đổi</p>
                                    </div>

                                    {/* Sex */}


                                    {/* Province */}
                                    <div className="cip-form-group">
                                        <label className="cip-form-label">
                                            <span className="cip-form-label-text">
                                                <i className="bi bi-geo-alt cip-form-label-icon"></i>
                                                Tỉnh/Thành phố
                                            </span>
                                        </label>
                                        <select
                                            name="province_id"
                                            className="cip-select"
                                            value={formData.province_id}
                                            onChange={handleInputChange}
                                        >
                                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                            {provinceList.map(row => (
                                                <option key={row.id} value={row.id}>{row.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Ward */}
                                    <div className="cip-form-group">
                                        <label className="cip-form-label">
                                            <span className="cip-form-label-text">
                                                <i className="bi bi-geo cip-form-label-icon"></i>
                                                Phường/Xã
                                            </span>
                                        </label>
                                        <select
                                            name="ward_id"
                                            className="cip-select"
                                            value={formData.ward_id}
                                            onChange={handleInputChange}
                                            disabled={!formData.province_id}
                                        >
                                            <option value="">-- Chọn Phường/Xã --</option>
                                            {wardList.map(row => (
                                                <option key={row.id} value={row.id}>{row.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* HighSchool */}
                                    <div className="cip-form-group full-width">
                                        <label className="cip-form-label">
                                            <span className="cip-form-label-text">
                                                <i className="bi bi-building cip-form-label-icon"></i>
                                                Trường THPT
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            name="highSchool"
                                            className="cip-input"
                                            value={formData.highSchool}
                                            onChange={handleInputChange}
                                            placeholder="Nhập tên trường THPT của bạn"
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="cip-form-actions">
                                    <button
                                        type="button"
                                        className="cip-btn cip-btn-cancel"
                                        onClick={handleReset}
                                        disabled={isSubmitting}
                                    >
                                        <i className="bi bi-x-lg"></i>
                                        Hủy thay đổi
                                    </button>
                                    <button
                                        type="submit"
                                        className="cip-btn cip-btn-save"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                                                Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <i className="bi bi-check-lg"></i>
                                                Lưu thay đổi
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
