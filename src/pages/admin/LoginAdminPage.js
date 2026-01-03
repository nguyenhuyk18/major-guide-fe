import React from 'react';
import '../../assets/css/LoginAdmin.css'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import { loginAdmin } from '../../services/authorizer.api';
import { LOGIN_ADMIN } from '../../constants/AuthAdminConstant';
export default function LoginAdminPage() {

    const navigate = useNavigate();
    const dispatch = useDispatch();

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
                const rs = await loginAdmin(values);

                const action = {
                    type: LOGIN_ADMIN,
                    payload: {
                        isLogin: true,
                        access_token: rs.data.data.access_token,
                        loggedUser: {
                            fileAvartarUrl: rs.data.data.fileAvartarUrl,
                            name: rs.data.data.name,
                            role_name: rs.data.data.role_name,
                            email: rs.data.data.email
                        }
                    }
                }
                dispatch(action);
                toast.success('Đăng nhập thành công !!');
                navigate('/admin')
            } catch (error) {
                console.log(error);
                toast.error('Tên đăng nhập hoặc mật khẩu không đúng !!')
            }

        },
    });

    return (
        <div className="admin-login-page">
            <div className="login-container">
                <div className="login-card">
                    {/* Lock Icon */}
                    <div className="lock-icon">
                        <i className="bi bi-lock-fill"></i>
                    </div>

                    {/* Title */}
                    <h1 className="login-title">Admin Login</h1>
                    <p className="login-subtitle">Chào mừng trở lại, vui lòng đăng nhập</p>

                    {/* Login Form */}
                    <form className="login-form" onSubmit={formik.handleSubmit}>

                        {/* Email Input */}
                        <div className="form-group">
                            <label htmlFor="username" className="form-label">
                                Tên người dùng
                            </label>
                            <div className="input-wrapper">
                                <i className="bi bi-person input-icon"></i>
                                <input
                                    style={{ paddingLeft: '40px', paddingRight: '25px' }}
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={formik.values.username}
                                    onChange={formik.handleChange}
                                    className="form-control"
                                    placeholder="Nhập username của bạn"
                                />
                            </div>
                            <div className="text-danger mt-2">{formik.touched.username && formik.errors.username}</div>
                        </div>

                        {/* Password Input */}
                        <div className="form-group">
                            <label htmlFor="password" className="form-label">
                                Mật khẩu
                            </label>
                            <div className="input-wrapper">
                                <i className="bi bi-key input-icon"></i>
                                <input
                                    style={{ paddingLeft: '40px', paddingRight: '25px' }}
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formik.values.password}
                                    onChange={formik.handleChange}
                                    className="form-control"
                                    placeholder="Nhập mật khẩu của bạn"
                                />
                            </div>
                            <div className="text-danger mt-2">{formik.touched.password && formik.errors.password}</div>
                        </div>


                        {/* Submit Button */}
                        <button type="submit" className="btn-login">
                            Đăng nhập
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="login-footer">
                        <p className="system-version">Hệ thống quản lý đặt lịch tư vấn</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
