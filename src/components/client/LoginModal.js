import { Link, useNavigate } from 'react-router-dom';
import '../../assets/css/LoginModal.css';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { LOGIN_ADMIN } from '../../constants/AuthAdminConstant';
import { loginClient } from '../../services/authorizer.api';
import { toast } from 'react-toastify';
// import { useState } from 'react';

export default function LoginModal() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const [isAble, setIsAble] = useState(true)

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

        onSubmit: async values => {
            try {
                // setIsAble(false);
                const rs = await loginClient(values);

                const action = {
                    type: LOGIN_ADMIN,
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


                dispatch(action);
                toast.success('Đăng nhập thành công !!!');
                navigate('/');
            } catch (error) {
                console.log(error);
                toast.error(error?.response?.data?.message || 'Đăng nhập thất bại !!!');
                navigate('/');
            }

        },
    });

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
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content client-login-modal-content">
                        <button
                            type="button"
                            className="btn-close client-modal-close"
                            data-bs-dismiss="modal"
                            aria-label="Close"
                        ></button>

                        <div className="modal-body client-login-modal-body">
                            {/* Logo */}
                            <div className="client-login-logo">
                                <div className="client-login-logo-icon">
                                    <i className="bi bi-mortarboard-fill"></i>
                                </div>
                                <h4 className="client-login-title">Đăng nhập MajorGuide</h4>
                                <p className="client-login-subtitle">Chào mừng bạn quay trở lại!</p>
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
                                            type="password"
                                            className="form-control client-form-input"
                                            id="clientPassword"
                                            placeholder="Nhập mật khẩu"
                                            name='password'
                                            value={formik.values.password}
                                            onChange={formik.handleChange}
                                        />

                                        <button type="button" className="client-password-toggle">
                                            <i className="bi bi-eye"></i>
                                        </button>
                                        <div className="text-danger mt-2">{formik.touched.password && formik.errors.password}</div>
                                    </div>
                                </div>

                                {/* Remember & Forgot */}
                                <div className="client-login-options">
                                    <Link className="client-forgot-link">Quên mật khẩu?</Link>
                                </div>

                                {/* Login Button */}
                                <button type="submit" className="btn client-btn-login-submit" data-bs-dismiss="modal">
                                    Đăng nhập
                                </button>

                                {/* Divider */}
                                <div className="client-login-divider">
                                    <span>Hoặc đăng nhập với</span>
                                </div>

                                {/* Social Login */}
                                <div className="client-social-login">
                                    <button type="button" className="btn client-btn-social client-btn-google">
                                        <i className="bi bi-google me-2"></i>
                                        Google
                                    </button>
                                    {/* <button type="button" className="btn client-btn-social client-btn-facebook">
                                        <i className="bi bi-facebook me-2"></i>
                                        Facebook
                                    </button> */}
                                </div>

                                {/* Register Link */}
                                <div className="client-register-link">
                                    Chưa có tài khoản? <Link data-bs-toggle="modal" data-bs-target="#registerClientModal" >Đăng ký ngay</Link>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
