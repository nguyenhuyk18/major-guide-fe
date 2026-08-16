import { useState, useEffect, useRef } from 'react';
import '../../assets/css/LoginModal.css';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { registerClient } from '../../services/authorizer.api';
import { getProvinceList, getWardByIdProvince } from '../../services/user-access.api';
import { toast } from 'react-toastify';

export default function RegisterModal() {
    const formikRef = useRef(null);
    const [provinceList, setProvinceList] = useState([]);
    const [wardList, setWardList] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadProvinces();
    }, []);

    useEffect(() => {
        const modalElement = document.getElementById('registerClientModal');
        if (!modalElement) return;

        const handleModalHidden = () => {
            if (formikRef.current) {
                formikRef.current.resetForm();
            }
            setWardList([]);
        };

        modalElement.addEventListener('hidden.bs.modal', handleModalHidden);
        return () => {
            modalElement.removeEventListener('hidden.bs.modal', handleModalHidden);
        };
    }, []);

    const loadProvinces = async () => {
        try {
            const rs = await getProvinceList();
            setProvinceList(rs.data.data);
        } catch (error) {
            console.error('Error loading provinces:', error);
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

    const closeModal = () => {
        const modalElement = document.getElementById('registerClientModal');
        if (modalElement) {
            const modalInstance = window.bootstrap?.Modal?.getInstance(modalElement);
            if (modalInstance) {
                modalInstance.hide();
            } else {
                // Fallback: remove all modal-related classes and backdrops manually
                modalElement.style.display = 'none';
                modalElement.classList.remove('show');
                modalElement.setAttribute('aria-hidden', 'true');
                modalElement.removeAttribute('aria-modal');
                modalElement.removeAttribute('role');
                document.body.classList.remove('modal-open');
                document.body.style.overflow = '';
                document.body.style.paddingRight = '';

                // Remove all modal backdrops
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
            }
        }
    };

    const formik = useFormik({
        innerRef: formikRef,
        initialValues: {
            username: '',
            firstname: '',
            lastname: '',
            email: '',
            password: '',
            confirmPassword: '',
            sex: '',
            province_id: '',
            ward_id: '',
            highSchool: '',
        },
        validationSchema: Yup.object({
            username: Yup.string()
                .required('Vui lòng nhập tên đăng nhập!')
                .min(4, 'Tên đăng nhập phải có ít nhất 4 ký tự!'),
            firstname: Yup.string()
                .required('Vui lòng nhập họ của bạn!')
                .min(2, 'Họ phải có ít nhất 2 ký tự!'),
            lastname: Yup.string()
                .required('Vui lòng nhập tên của bạn!')
                .min(2, 'Tên phải có ít nhất 2 ký tự!'),
            email: Yup.string()
                .required('Vui lòng nhập email!')
                .email('Email không hợp lệ!'),
            password: Yup.string()
                .required('Vui lòng nhập mật khẩu!')
                .min(8, 'Mật khẩu phải có ít nhất 8 ký tự!')
                .matches(/[A-Z]/, 'Mật khẩu phải chứa ít nhất 1 chữ hoa!')
                .matches(/[0-9]/, 'Mật khẩu phải chứa ít nhất 1 số!'),
            confirmPassword: Yup.string()
                .required('Vui lòng xác nhận mật khẩu!')
                .oneOf([Yup.ref('password')], 'Mật khẩu xác nhận không khớp!'),
            sex: Yup.string()
                .required('Vui lòng chọn giới tính!'),
            province_id: Yup.string()
                .required('Vui lòng chọn Tỉnh/Thành phố!'),
            ward_id: Yup.string()
                .required('Vui lòng chọn Phường/Xã!'),
            highSchool: Yup.string()
                .required('Vui lòng nhập tên trường THPT!')
                .min(3, 'Tên trường phải có ít nhất 3 ký tự!'),
        }),
        onSubmit: async (values, { resetForm }) => {
            setIsSubmitting(true);
            try {
                const dataToSubmit = {
                    username: values.username,
                    firstname: values.firstname,
                    lastname: values.lastname,
                    email: values.email,
                    password: values.password,
                    ward_id: values.ward_id,
                    role_name: 'member',
                    sex: values.sex,
                    statusAccount: 'active',
                    memberProfile: {
                        highSchool: values.highSchool,
                    },
                };

                await registerClient(dataToSubmit);

                toast.success('Đăng ký tài khoản thành công! Vui lòng đăng nhập.');
                closeModal();
            } catch (error) {
                console.error('Registration error:', error);
                const errorMessage = error?.response?.data?.message || 'Đăng ký thất bại! Vui lòng thử lại.';
                toast.error(errorMessage);
            } finally {
                resetForm();
                setWardList([]);
                setIsSubmitting(false);
            }
        },
    });
    formikRef.current = formik;

    return (
        <>
            <div
                className="modal fade"
                id="registerClientModal"
                tabIndex="-1"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                role="dialog"
                aria-labelledby="modalTitleId"
                aria-hidden="true"
            >
                <div
                    className="modal-dialog modal-dialog-scrollable modal-dialog-centered modal-lg client-auth-dialog client-register-dialog"
                    role="document"
                >
                    <div className="modal-content client-login-modal-content">
                        <button
                            type="button"
                            className="btn-close client-modal-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>

                        <div className="modal-body client-login-modal-body">
                            <div className="client-auth-kicker">
                                <span></span>
                                Bắt đầu cùng MajorGuide
                            </div>
                            <div className="client-login-logo">
                                <div className="client-login-logo-icon">
                                    <i className="bi bi-person-plus-fill"></i>
                                </div>
                                <h4 className="client-login-title">Đăng ký tài khoản</h4>
                                <p className="client-login-subtitle">Tạo hồ sơ để nhận tư vấn và kết nối với chuyên gia phù hợp.</p>
                            </div>

                            {/* Register Form */}
                            <form className="client-login-form" onSubmit={formik.handleSubmit}>
                                {/* Row 1: Username */}
                                <div className="mb-3">
                                    <label htmlFor="registerUsername" className="form-label client-form-label">
                                        <i className="bi bi-person me-2"></i>
                                        Tên đăng nhập
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control client-form-input ${formik.touched.username && formik.errors.username ? 'is-invalid' : ''}`}
                                        id="registerUsername"
                                        placeholder="Nhập tên đăng nhập"
                                        name="username"
                                        value={formik.values.username}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.username && formik.errors.username && (
                                        <div className="text-danger mt-2 small">{formik.errors.username}</div>
                                    )}
                                </div>

                                {/* Row 2: Firstname & Lastname */}
                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label htmlFor="registerFirstname" className="form-label client-form-label">
                                            <i className="bi bi-person me-2"></i>
                                            Họ
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control client-form-input ${formik.touched.firstname && formik.errors.firstname ? 'is-invalid' : ''}`}
                                            id="registerFirstname"
                                            placeholder="Họ của bạn"
                                            name="firstname"
                                            value={formik.values.firstname}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.firstname && formik.errors.firstname && (
                                            <div className="text-danger mt-2 small">{formik.errors.firstname}</div>
                                        )}
                                    </div>
                                    <div className="col-6">
                                        <label htmlFor="registerLastname" className="form-label client-form-label">
                                            <i className="bi bi-person me-2"></i>
                                            Tên
                                        </label>
                                        <input
                                            type="text"
                                            className={`form-control client-form-input ${formik.touched.lastname && formik.errors.lastname ? 'is-invalid' : ''}`}
                                            id="registerLastname"
                                            placeholder="Tên của bạn"
                                            name="lastname"
                                            value={formik.values.lastname}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.lastname && formik.errors.lastname && (
                                            <div className="text-danger mt-2 small">{formik.errors.lastname}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 3: Email */}
                                <div className="mb-3">
                                    <label htmlFor="registerEmail" className="form-label client-form-label">
                                        <i className="bi bi-envelope me-2"></i>
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        className={`form-control client-form-input ${formik.touched.email && formik.errors.email ? 'is-invalid' : ''}`}
                                        id="registerEmail"
                                        placeholder="Nhập địa chỉ email"
                                        name="email"
                                        value={formik.values.email}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.email && formik.errors.email && (
                                        <div className="text-danger mt-2 small">{formik.errors.email}</div>
                                    )}
                                </div>

                                {/* Row 4: Password & Confirm Password */}
                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label htmlFor="registerPassword" className="form-label client-form-label">
                                            <i className="bi bi-lock me-2"></i>
                                            Mật khẩu
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control client-form-input ${formik.touched.password && formik.errors.password ? 'is-invalid' : ''}`}
                                            id="registerPassword"
                                            placeholder="Nhập mật khẩu"
                                            name="password"
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.password && formik.errors.password && (
                                            <div className="text-danger mt-2 small">{formik.errors.password}</div>
                                        )}
                                    </div>
                                    <div className="col-6">
                                        <label htmlFor="registerConfirmPassword" className="form-label client-form-label">
                                            <i className="bi bi-lock-fill me-2"></i>
                                            Xác nhận mật khẩu
                                        </label>
                                        <input
                                            type="password"
                                            className={`form-control client-form-input ${formik.touched.confirmPassword && formik.errors.confirmPassword ? 'is-invalid' : ''}`}
                                            id="registerConfirmPassword"
                                            placeholder="Nhập lại mật khẩu"
                                            name="confirmPassword"
                                            value={formik.values.confirmPassword}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        {formik.touched.confirmPassword && formik.errors.confirmPassword && (
                                            <div className="text-danger mt-2 small">{formik.errors.confirmPassword}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 5: Sex */}
                                <div className="mb-3">
                                    <label className="form-label client-form-label d-block">
                                        <i className="bi bi-gender-ambiguous me-2"></i>
                                        Giới tính
                                    </label>
                                    <div className="d-flex gap-4 mt-2">
                                        <div className="form-check">
                                            <input
                                                className="form-check-input client-checkbox"
                                                type="radio"
                                                name="sex"
                                                id="registerSexMale"
                                                value="male"
                                                checked={formik.values.sex === 'male'}
                                                onChange={formik.handleChange}
                                            />
                                            <label className="form-check-label client-checkbox-label" htmlFor="registerSexMale">
                                                Nam
                                            </label>
                                        </div>
                                        <div className="form-check">
                                            <input
                                                className="form-check-input client-checkbox"
                                                type="radio"
                                                name="sex"
                                                id="registerSexFemale"
                                                value="female"
                                                checked={formik.values.sex === 'female'}
                                                onChange={formik.handleChange}
                                            />
                                            <label className="form-check-label client-checkbox-label" htmlFor="registerSexFemale">
                                                Nữ
                                            </label>
                                        </div>
                                    </div>
                                    {formik.touched.sex && formik.errors.sex && (
                                        <div className="text-danger mt-2 small">{formik.errors.sex}</div>
                                    )}
                                </div>

                                {/* Row 6: Province & Ward */}
                                <div className="row g-3 mb-3">
                                    <div className="col-6">
                                        <label htmlFor="registerProvince" className="form-label client-form-label">
                                            <i className="bi bi-geo-alt me-2"></i>
                                            Tỉnh/Thành phố
                                        </label>
                                        <select
                                            className={`form-select client-form-input ${formik.touched.province_id && formik.errors.province_id ? 'is-invalid' : ''}`}
                                            id="registerProvince"
                                            name="province_id"
                                            value={formik.values.province_id}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                formik.setFieldValue('province_id', val);
                                                formik.setFieldValue('ward_id', '');
                                                setWardList([]);
                                                if (val) {
                                                    loadWards(val);
                                                }
                                            }}
                                            onBlur={formik.handleBlur}
                                            style={{ padding: '1rem 1.25rem' }}
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
                                    <div className="col-6">
                                        <label htmlFor="registerWard" className="form-label client-form-label">
                                            <i className="bi bi-geo-alt-fill me-2"></i>
                                            Phường/Xã
                                        </label>
                                        <select
                                            className={`form-select client-form-input ${formik.touched.ward_id && formik.errors.ward_id ? 'is-invalid' : ''}`}
                                            id="registerWard"
                                            name="ward_id"
                                            value={formik.values.ward_id}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            disabled={!formik.values.province_id}
                                            style={{ padding: '1rem 1.25rem' }}
                                        >
                                            <option value="">-- Chọn Phường/Xã --</option>
                                            {wardList.map(row => (
                                                <option key={row.id} value={row.id}>{row.name}</option>
                                            ))}
                                        </select>
                                        {formik.touched.ward_id && formik.errors.ward_id && (
                                            <div className="text-danger mt-2 small">{formik.errors.ward_id}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Row 7: HighSchool */}
                                <div className="mb-4">
                                    <label htmlFor="registerHighSchool" className="form-label client-form-label">
                                        <i className="bi bi-school me-2"></i>
                                        Trường THPT
                                    </label>
                                    <input
                                        type="text"
                                        className={`form-control client-form-input ${formik.touched.highSchool && formik.errors.highSchool ? 'is-invalid' : ''}`}
                                        id="registerHighSchool"
                                        placeholder="Nhập tên trường THPT của bạn"
                                        name="highSchool"
                                        value={formik.values.highSchool}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                    />
                                    {formik.touched.highSchool && formik.errors.highSchool && (
                                        <div className="text-danger mt-2 small">{formik.errors.highSchool}</div>
                                    )}
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="btn client-btn-login-submit"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Đang xử lý...
                                        </>
                                    ) : (
                                        'Đăng ký'
                                    )}
                                </button>

                                {/* Login Link */}
                                <div className="client-register-link">
                                    Đã có tài khoản? <button type="button" className="client-auth-switch" data-bs-toggle="modal" data-bs-target="#loginClientModal">Đăng nhập ngay</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
