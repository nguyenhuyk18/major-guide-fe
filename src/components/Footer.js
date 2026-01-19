// import React from 'react';
import { Link } from 'react-router-dom';
import '../assets/css/Footer.css'
import LoginModal from './client/LoginModal';
import RegisterModal from './client/RegisterModal';
// import LoginModal from './client/RegisterModal';

export default function Footer() {
    return (
        <>
            <RegisterModal />
            <LoginModal />
            <footer className="client-footer">
                <div className="container">
                    <div className="client-footer-content">
                        <div className="row g-4">
                            {/* About Section */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="client-footer-section">
                                    <div className="client-footer-logo">
                                        <div className="client-footer-logo-icon">
                                            <i className="bi bi-mortarboard-fill"></i>
                                        </div>
                                        <span className="client-footer-logo-text">EduGuide</span>
                                    </div>
                                    <p className="client-footer-description">
                                        Nền tảng tư vấn hướng nghiệp hàng đầu Việt Nam. Giúp bạn tìm ra con đường phù hợp với bản thân và chuẩn bị cho tương lai tốt hơn.
                                    </p>
                                    <div className="client-footer-social">
                                        <Link className="client-social-link">
                                            <i className="bi bi-facebook"></i>
                                        </Link>
                                        <Link className="client-social-link">
                                            <i className="bi bi-twitter"></i>
                                        </Link>
                                        <Link className="client-social-link">
                                            <i className="bi bi-instagram"></i>
                                        </Link>
                                        <Link className="client-social-link">
                                            <i className="bi bi-youtube"></i>
                                        </Link>
                                    </div>
                                </div>
                            </div>

                            {/* Explore Links */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="client-footer-section">
                                    <h3 className="client-footer-title">Khám phá</h3>
                                    <ul className="client-footer-links">
                                        <li><Link >Tuyển đại học</Link></li>
                                        <li><Link >Ngành học</Link></li>
                                        <li><Link >Học bổng</Link></li>
                                        <li><Link >Sự kiện</Link></li>
                                    </ul>
                                </div>
                            </div>

                            {/* Community Links */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="client-footer-section">
                                    <h3 className="client-footer-title">Cộng đồng</h3>
                                    <ul className="client-footer-links">
                                        <li><Link >Hỏi đáp</Link></li>
                                        <li><Link >Cho tả kính nghiệm</Link></li>
                                        <li><Link >Review trường</Link></li>
                                        <li><Link >Tài liệu ôn thi</Link></li>
                                    </ul>
                                </div>
                            </div>

                            {/* Support Links */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="client-footer-section">
                                    <h3 className="client-footer-title">Hỗ trợ</h3>
                                    <ul className="client-footer-links">
                                        <li><Link >Liên hệ</Link></li>
                                        <li><Link >Chính sách bảo mật</Link></li>
                                        <li><Link >Điều khoản sử dụng</Link></li>
                                        <li><Link >Hướng dẫn sử dụng</Link></li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Bottom */}
                    <div className="client-footer-bottom">
                        <p className="client-footer-copyright">
                            © 2024 EduGuide. All rights reserved.
                        </p>
                        <p className="client-footer-credits">
                            Made with <i className="bi bi-heart-fill"></i> in Vietnam
                        </p>
                    </div>
                </div>
            </footer>
        </>
    );
}
