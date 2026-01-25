import React, { useEffect, useState, useRef } from 'react';
import '../../assets/css/InformationPage.css'
import { Link } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { getUserAccess, updateUserAccess, updateFileAvartar, getProvinceList, getWardByIdProvince } from '../../services/user-access.api';
import { UPDATED_LOGGED_USER_ADMIN } from '../../constants/AuthAdminConstant';

export default function InformationPage() {

    const dispatch = useDispatch();

    const [disalbleChangeAvartar, setDisalbleChangeAvartar] = useState(false);
    const { loggedUser } = useSelector(state => state.authAdminReducer);
    const [currentUser, setCurrentUser] = useState(null);
    const [provinceList, setProvinceList] = useState([]);
    const [wardList, setWardList] = useState([]);
    const fileInputRef = useRef(null);

    const isExpert = loggedUser?.role_name === 'expert';
    const isAdmin = loggedUser?.role_name === 'admin';

    useEffect(() => {
        getProvinces();
    }, []);

    useEffect(() => {
        if (loggedUser?.id) {
            fetchUserData(loggedUser.id);
        }
    }, [loggedUser]);

    const getProvinces = async () => {
        try {
            const rs = await getProvinceList();
            setProvinceList(rs.data.data);
        } catch (error) {
            console.error('Error fetching provinces:', error);
        }
    };

    const fetchUserData = async (id) => {
        try {
            const res = await getUserAccess(id);
            if (res.data && res.data.data) {
                const userData = res.data.data;
                setCurrentUser(userData);

                // Update formik values
                formik.setValues({
                    fullName: userData.name || '',
                    major: userData.expertProfile?.major || '',
                    level: userData.expertProfile?.level || 'bachelor',
                    price: userData.expertProfile?.price || '',
                    province_id: userData.ward?.province_id || '',
                    ward_id: userData.wardId || '',
                    teachingLocation: userData.expertProfile?.teachAt || '',
                    bio: userData.expertProfile?.information || '',
                });

                // Load wards if province exists
                if (userData.ward?.province_id) {
                    loadWards(userData.ward.province_id);
                }
            }
        } catch (error) {
            console.error("Failed to fetch user data", error);
        }
    };

    const loadWards = async (provinceId) => {
        try {
            const rs = await getWardByIdProvince(provinceId);
            setWardList(rs.data.data);
        } catch (error) {
            console.error('Error loading wards:', error);
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);
        setDisalbleChangeAvartar(true);
        try {
            const res = await updateFileAvartar(loggedUser.id, formData);
            // console.log(res);
            if (res.data && res.data.data) {
                const newAvatarUrl = res.data.data.data;
                toast.success('Cập nhật ảnh đại diện thành công!');

                // Update Redux state
                dispatch({
                    type: UPDATED_LOGGED_USER_ADMIN,
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
            console.error("Update avatar error", error);
            toast.error('Cập nhật ảnh đại diện thất bại!');
        }
        setDisalbleChangeAvartar(false);
    };

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            fullName: '',
            major: '',
            level: 'bachelor',
            price: '',
            province_id: '',
            ward_id: '',
            teachingLocation: '',
            bio: ''
        },

        validationSchema: Yup.object({
            fullName: Yup.string().required('Vui lòng nhập họ và tên').min(3, 'Họ và tên phải có ít nhất 3 ký tự'),
            province_id: Yup.string().required('Vui lòng chọn Tỉnh/Thành phố'),
            ward_id: Yup.string().required('Vui lòng chọn Phường/Quận'),
        }),

        onSubmit: async (values) => {
            const dataToUpdate = {
                name: values.fullName,
                wardId: values.ward_id,
                expertProfile: isExpert ? {
                    teachAt: values.teachingLocation,
                    information: values.bio,
                    major: values.major,
                    level: values.level,
                    price: Number(values.price) || 0
                } : undefined
            };

            try {
                const res = await updateUserAccess(loggedUser.id, dataToUpdate);
                if (res.data) {
                    toast.success('Cập nhật thông tin thành công!');

                    // Update Redux state with new name
                    dispatch({
                        type: UPDATED_LOGGED_USER_ADMIN,
                        payload: {
                            loggedUser: {
                                ...loggedUser,
                                name: values.fullName
                            }
                        }
                    });

                    fetchUserData(loggedUser.id);
                }
            } catch (error) {
                console.error('Error updating information:', error);
                toast.error('Cập nhật thông tin thất bại!');
            }
        },
    });

    return (
        <div className="container-fluid p-4 info-page-container" style={{ backgroundColor: '#0a0e27' }} >
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-4">
                <ol className="info-page-breadcrumb">
                    <li className="info-page-breadcrumb-item">
                        <Link to={'/'} className="info-page-breadcrumb-link">Dashboard</Link>
                        <span className="info-page-breadcrumb-separator">›</span>
                    </li>
                    <li className="info-page-breadcrumb-item">
                        <Link to={'/'} className="info-page-breadcrumb-link">Chuyên gia</Link>
                        <span className="info-page-breadcrumb-separator">›</span>
                    </li>
                    <li className="info-page-breadcrumb-item">
                        <span className="info-page-breadcrumb-active">Chỉnh sửa Thông tin</span>
                    </li>
                </ol>
            </nav>

            {/* Page Header */}
            <div className="mb-4 info-page-header">
                <h1 className="info-page-title">Chỉnh sửa Thông tin Cá nhân Chuyên gia</h1>
                <p className="info-page-subtitle">Cập nhật thông tin chi tiết, tiểu sử và trình độ chuyên môn của tư vấn viên.</p>
            </div>

            {/* Main Content */}
            <div className="row g-4">
                {/* Left Column - Avatar Card */}
                <div className="col-12 col-lg-4">
                    <div className="info-page-card">
                        <div className="card-body p-4">
                            {/* Avatar */}
                            <div className="text-center mb-4">
                                <div className="position-relative d-inline-block">
                                    <img
                                        src={currentUser?.fileAvartarUrl || "https://i.pravatar.cc/300?img=12"}
                                        alt="Expert Avatar"
                                        className="rounded-circle info-page-avatar"
                                        style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                                    />
                                    <button
                                        className="btn rounded-circle position-absolute bottom-0 end-0 info-page-camera-btn"
                                        onClick={handleAvatarClick}
                                        disabled={disalbleChangeAvartar}
                                    >
                                        <i className="bi bi-camera-fill"></i>
                                    </button>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        hidden
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </div>

                            {/* Name and Role */}
                            <h3 className="info-page-name text-center mb-2">{formik.values.fullName}</h3>
                            <p className="info-page-role text-center mb-4">Chuyên gia tư vấn cao cấp</p>

                            {/* Change Photo Button */}
                            {/* Change Photo Button */}
                            <button
                                className="btn info-page-btn-change-photo w-100 mb-4"
                                onClick={handleAvatarClick}
                            >
                                Thay đổi ảnh đại diện
                            </button>

                            {/* Status Section */}
                            <div className="info-page-divider">
                                <div className="d-flex justify-content-between align-items-center mb-3">
                                    <span className="info-page-status-label">Trạng thái hồ sơ</span>
                                    <span className="info-page-badge-verified">ĐÃ XÁC MINH</span>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                    <span className="info-page-status-label">Ngày tham gia</span>
                                    <span className="info-page-status-value">12/05/2023</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Form Card */}
                <div className="col-12 col-lg-8">
                    <div className="info-page-card">
                        <div className="card-body p-4">
                            <form onSubmit={formik.handleSubmit}>
                                {/* Row 1: Họ và Tên + Chuyên môn */}
                                <div className="row g-3 mb-3">
                                    <div className="col-12 col-md-6">
                                        <label className="info-page-form-label">Họ và Tên</label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            className="form-control info-page-form-control"
                                            value={formik.values.fullName}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.fullName && formik.errors.fullName && (
                                            <div className="text-danger mt-2 small">{formik.errors.fullName}</div>
                                        )}
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="info-page-form-label">Chuyên môn (Major)</label>
                                        <input
                                            type="text"
                                            name="major"
                                            className="form-control info-page-form-control"
                                            value={formik.values.major}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={isAdmin}
                                        />
                                        {formik.touched.major && formik.errors.major && (
                                            <div className="text-danger mt-2 small">{formik.errors.major}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 2: Cấp bậc + Giá dịch vụ */}
                                <div className="row g-3 mb-3">
                                    <div className="col-12 col-md-6">
                                        <label className="info-page-form-label">Cấp bậc/Trình độ</label>
                                        <select
                                            name="level"
                                            className="form-select info-page-form-select"
                                            value={formik.values.level}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={isAdmin}
                                        >
                                            <option value="bachelor">Cử nhân</option>
                                            <option value="master">Thạc sĩ</option>
                                            <option value="doctor">Tiến sĩ</option>
                                            <option value="professor">Giáo sư</option>
                                        </select>
                                        {formik.touched.level && formik.errors.level && (
                                            <div className="text-danger mt-2 small">{formik.errors.level}</div>
                                        )}
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="info-page-form-label">Giá dịch vụ (mỗi giờ)</label>
                                        <div className="info-page-price-input">
                                            <input
                                                type="number"
                                                name="price"
                                                className="form-control info-page-form-control"
                                                value={formik.values.price}
                                                onChange={formik.handleChange}
                                                onBlur={formik.handleBlur}
                                                placeholder="Nhập giá dịch vụ"
                                                disabled={isAdmin}
                                            />
                                            <span className="info-page-price-currency">VNĐ</span>
                                        </div>
                                        {formik.touched.price && formik.errors.price && (
                                            <div className="text-danger mt-2 small">{formik.errors.price}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 3: Địa chỉ - Tỉnh/Thành phố và Phường/Quận */}
                                <div className="row g-3 mb-3">
                                    <div className="col-12 col-md-6">
                                        <label className="info-page-form-label">Tỉnh/Thành phố</label>
                                        <select
                                            name="province_id"
                                            className="form-select info-page-form-select"
                                            value={formik.values.province_id}
                                            onChange={async (e) => {
                                                const val = e.target.value;
                                                formik.setFieldValue("province_id", val);
                                                formik.setFieldValue("ward_id", '');

                                                if (!val) {
                                                    setWardList([]);
                                                    return;
                                                }

                                                try {
                                                    const rs = await getWardByIdProvince(val);
                                                    setWardList(rs.data.data);
                                                } catch (error) {
                                                    toast.error('Lỗi khi tải danh sách phường!');
                                                }
                                            }}
                                            onBlur={formik.handleBlur}
                                        >
                                            <option value="">-- Chọn Tỉnh/Thành phố --</option>
                                            {provinceList.map(row => (
                                                <option key={row.id} value={row.id}>{row.name}</option>
                                            ))}
                                        </select>
                                        {formik.touched.province_id && formik.errors.province_id && (
                                            <div className="text-danger mt-2 small">{formik.errors.province_id}</div>
                                        )}
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label className="info-page-form-label">Phường/Quận</label>
                                        <select
                                            name="ward_id"
                                            className="form-select info-page-form-select"
                                            value={formik.values.ward_id}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        >
                                            <option value="">-- Chọn Phường/Quận --</option>
                                            {wardList.map(row => (
                                                <option key={row.id} value={row.id}>{row.name}</option>
                                            ))}
                                        </select>
                                        {formik.touched.ward_id && formik.errors.ward_id && (
                                            <div className="text-danger mt-2 small">{formik.errors.ward_id}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 4: Địa điểm dạy */}
                                <div className="mb-3">
                                    <label className="info-page-form-label">Địa điểm dạy (Where teaching)</label>
                                    <input
                                        type="text"
                                        name="teachingLocation"
                                        className="form-control info-page-form-control"
                                        value={formik.values.teachingLocation}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={isAdmin}
                                    />
                                    {formik.touched.teachingLocation && formik.errors.teachingLocation && (
                                        <div className="text-danger mt-2 small">{formik.errors.teachingLocation}</div>
                                    )}
                                </div>

                                {/* Row 5: Tiểu sử */}
                                <div className="mb-4">
                                    <label className="info-page-form-label">Tiểu sử & Thông tin chi tiết</label>
                                    <textarea
                                        name="bio"
                                        className="form-control info-page-form-control"
                                        rows="6"
                                        value={formik.values.bio}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        disabled={isAdmin}
                                    ></textarea>
                                    {formik.touched.bio && formik.errors.bio && (
                                        <div className="text-danger mt-2 small">{formik.errors.bio}</div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="d-flex justify-content-end gap-3">
                                    <button type="button" className="btn info-page-btn-cancel px-4" onClick={() => formik.resetForm()}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn info-page-btn-save px-4">
                                        <i className="bi bi-floppy me-2"></i>
                                        Lưu thay đổi
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
