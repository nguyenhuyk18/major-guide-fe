import { useDispatch, useSelector } from 'react-redux';
import '../assets/css/Header.css'
import { Link, useNavigate } from 'react-router-dom';
import { LOGOUT_ADMIN } from '../constants/AuthAdminConstant';

export default function Header() {

    const userInfo = useSelector(state => state.authAdminReducer.loggedUser);
    const isLogin = useSelector(state => state.authAdminReducer.isLogin)
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const handleLogout = () => {
        const action = {
            // isLogin: false,
            type: LOGOUT_ADMIN

        }
        dispatch(action);
        navigate('/');
    }

    return (
        <>
            <header className="client-header">
                <div className="container">
                    <div className="client-header-content">
                        {/* Logo */}
                        <div className="client-logo" style={{ cursor: 'pointer' }}>
                            <div className="client-logo-icon">
                                <i className="bi bi-mortarboard-fill"></i>
                            </div>
                            <span className="client-logo-text">MajorGuide</span>
                        </div>

                        {/* Navigation */}
                        <nav className="client-nav">
                            <Link className="client-nav-link active">Trang chủ</Link>
                            <Link className="client-nav-link">Chuyên gia</Link>
                            <Link className="client-nav-link">Đại học</Link>
                            <Link className="client-nav-link">Tra Noc</Link>
                            <Link className="client-nav-link">Liên hệ</Link>
                        </nav>

                        {/* Actions */}
                        {
                            isLogin ? <>
                                <button className="btn btn-outline-secondary dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                                    <i className="fa fa-user" /> {userInfo.name}
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                                    <li>
                                        <Link className="nav-link" to="/thong-tin-ca-nhan.html">Thông tin tài khoản</Link>
                                    </li>
                                    <li>
                                        <Link className="nav-link" to="/lich-su-don-hang.html">Lịch sử đơn hàng</Link>
                                    </li>
                                    <li>
                                        <Link className="nav-link" to="/dia-chi-giao-hang-mac-dinh.html">Địa Chỉ Giao Hàng Mặc Định</Link>
                                    </li>

                                    <li>
                                        <hr className="dropdown-divider" />
                                    </li>
                                    <li>
                                        <Link className="dropdown-item text-danger" onClick={() => handleLogout()}>Đăng xuất</Link>
                                    </li>
                                </ul>

                            </> : <div className="client-header-actions">
                                <button className="client-btn-login" data-bs-toggle="modal" data-bs-target="#registerClientModal" >Đăng ký</button>
                                <button className="client-btn-register" data-bs-toggle="modal" data-bs-target="#loginClientModal">Đăng nhập</button>
                            </div>
                        }
                        {/* <div className="client-header-actions">
                            <button className="client-btn-login" data-bs-toggle="modal" data-bs-target="#registerClientModal" >Đăng ký</button>
                            <button className="client-btn-register" data-bs-toggle="modal" data-bs-target="#loginClientModal">Đăng nhập</button>
                        </div> */}
                    </div>
                </div>
            </header>
        </>
    );
}
