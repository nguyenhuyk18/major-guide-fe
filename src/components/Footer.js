// import React from 'react';
import '../assets/css/Footer.css'

export default function Footer() {
    return (
        <>
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
                                        <a href="#" className="client-social-link">
                                            <i className="bi bi-facebook"></i>
                                        </a>
                                        <a href="#" className="client-social-link">
                                            <i className="bi bi-twitter"></i>
                                        </a>
                                        <a href="#" className="client-social-link">
                                            <i className="bi bi-instagram"></i>
                                        </a>
                                        <a href="#" className="client-social-link">
                                            <i className="bi bi-youtube"></i>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Explore Links */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="client-footer-section">
                                    <h3 className="client-footer-title">Khám phá</h3>
                                    <ul className="client-footer-links">
                                        <li><a href="#">Tuyển đại học</a></li>
                                        <li><a href="#">Ngành học</a></li>
                                        <li><a href="#">Học bổng</a></li>
                                        <li><a href="#">Sự kiện</a></li>
                                    </ul>
                                </div>
                            </div>

                            {/* Community Links */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="client-footer-section">
                                    <h3 className="client-footer-title">Cộng đồng</h3>
                                    <ul className="client-footer-links">
                                        <li><a href="#">Hỏi đáp</a></li>
                                        <li><a href="#">Cho tả kính nghiệm</a></li>
                                        <li><a href="#">Review trường</a></li>
                                        <li><a href="#">Tài liệu ôn thi</a></li>
                                    </ul>
                                </div>
                            </div>

                            {/* Support Links */}
                            <div className="col-12 col-md-6 col-lg-3">
                                <div className="client-footer-section">
                                    <h3 className="client-footer-title">Hỗ trợ</h3>
                                    <ul className="client-footer-links">
                                        <li><a href="#">Liên hệ</a></li>
                                        <li><a href="#">Chính sách bảo mật</a></li>
                                        <li><a href="#">Điều khoản sử dụng</a></li>
                                        <li><a href="#">Hướng dẫn sử dụng</a></li>
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
