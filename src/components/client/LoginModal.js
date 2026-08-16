import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import '../../assets/css/LoginModal.css';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LOGOUT_ADMIN } from '../../constants/AuthAdminConstant';
import { loginClient } from '../../services/authorizer.api';
import { toast } from 'react-toastify';
import { LOGIN } from '../../constants/AuthConstant';

export default function LoginModal() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const formikRef = useRef(null);
    const [showPassword, setShowPassword] = useState(false);

    const closeModal = () => {
        document
            .querySelector('#loginClientModal [data-bs-dismiss="modal"]')
            ?.click();
    };

    const formik = useFormik({
        // Khởi động giá trị cho thẻ nhập liệu
        initialValues: {
            username: '',
            password: '',
        },
        // Kiểm tra dữ liệu hợp lệ không
        validationSchema: Yup.object({
            username: Yup.string().required('Vui lòng nhập tên đăng nhập của bạn !!'),
            password: Yup.string().required('Vui lòng nhập mật khẩu của bạn !!')
        }),

        onSubmit: async (values, { resetForm, setSubmitting }) => {
            try {
                const rs = await loginClient(values);

                if (rs.data.data.roleName !== 'member') {
                    toast.info('Tài khoản chuyên gia vui lòng đăng nhập tại khu vực quản trị.');
                    closeModal();
                    navigate('/admin/login');
                    return;
                }

                const action = {
                    type: LOGIN,
                    payload: {
                        isLogin: true,
                        access_token: rs.data.data.access_token,
                        loggedUser: {
                            fileAvartarUrl: rs.data.data.fileAvartarUrl,
                            name: rs.data.data.name,
                            role_name: rs.data.data.roleName,
                            email: rs.data.data.email,
                            id: rs.data.data.id
                        }
                    }
                }

                const action1 = {
                    type: LOGOUT_ADMIN
                }

                dispatch(action1);
                dispatch(action);
                toast.success('Đăng nhập thành công !!!');
                closeModal();
                navigate('/');
            } catch (error) {
                console.log(error);
                toast.error(error?.response?.data?.message || 'Đăng nhập thất bại !!!');
            } finally {
                resetForm();
                setShowPassword(false);
                setSubmitting(false);
            }

        },
    });
    formikRef.current = formik;

    useEffect(() => {
        const modalElement = document.getElementById('loginClientModal');
        if (!modalElement) return undefined;

        const clearForm = () => {
            formikRef.current?.resetForm();
            setShowPassword(false);
        };

        modalElement.addEventListener('hidden.bs.modal', clearForm);
        return () => modalElement.removeEventListener('hidden.bs.modal', clearForm);
    }, []);

    return (
        <>
            <div
                className="modal fade"
                id="loginClientModal"
                tabIndex="-1"
                data-bs-backdrop="static"
                data-bs-keyboard="false"
                aria-labelledby="loginClientModalLabel"
                aria-hidden="true"
            >
                <div className="modal-dialog modal-dialog-centered client-auth-dialog">
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
                                Không gian định hướng của bạn
                            </div>
                            <div className="client-login-logo">
                                <div className="client-login-logo-icon">
                                    <i className="bi bi-mortarboard-fill"></i>
                                </div>
                                <h4 className="client-login-title">Đăng nhập MajorGuide</h4>
                                <p className="client-login-subtitle">Tiếp tục hành trình chọn ngành, chọn trường cùng cộng đồng MajorGuide.</p>
                            </div>

                            {/* Login Form */}
                            <form className="client-login-form" onSubmit={formik.handleSubmit}>
                                {/* Username */}
                                <div className="mb-3">
                                    <label htmlFor="clientUsername" className="form-label client-form-label">
                                        <i className="bi bi-person me-2"></i>
                                        Tên đăng nhập
                                    </label>
                                    <input
                                        type="text"
                                        className="form-control client-form-input"
                                        id="clientUsername"
                                        placeholder="Nhập tên đăng nhập"
                                        name='username'
                                        value={formik.values.username}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        autoComplete="username"
                                    />
                                    <div className="text-danger mt-2">{formik.touched.username && formik.errors.username}</div>
                                </div>

                                {/* Password */}
                                <div className="mb-3">
                                    <label htmlFor="clientPassword" className="form-label client-form-label">
                                        <i className="bi bi-lock me-2"></i>
                                        Mật khẩu
                                    </label>
                                    <div className="client-password-wrapper">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            className="form-control client-form-input"
                                            id="clientPassword"
                                            placeholder="Nhập mật khẩu"
                                            name='password'
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                            autoComplete="current-password"
                                        />

                                        <button
                                            type="button"
                                            className="client-password-toggle"
                                            onClick={() => setShowPassword(value => !value)}
                                            aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                                        >
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                                        </button>
                                    </div>
                                    <div className="text-danger mt-2">{formik.touched.password && formik.errors.password}</div>
                                </div>

                                {/* Remember & Forgot */}
                                <div className="client-login-options">
                                    <Link className="client-forgot-link">Quên mật khẩu?</Link>
                                </div>

                                {/* Login Button */}
                                <button type="submit" className="btn client-btn-login-submit" disabled={formik.isSubmitting}>
                                    {formik.isSubmitting ? <><span className="spinner-border spinner-border-sm me-2" />Đang đăng nhập...</> : 'Đăng nhập'}
                                </button>

                                {/* Divider */}
                                {/* Register Link */}
                                <div className="client-register-link">
                                    Chưa có tài khoản? <button type="button" className="client-auth-switch" data-bs-toggle="modal" data-bs-target="#registerClientModal">Đăng ký ngay</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
