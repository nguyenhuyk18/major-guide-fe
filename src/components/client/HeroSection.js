import React from 'react';
import { Link } from 'react-router-dom';

export default function HeroSection() {
    return (
        <section className="client-hero-section">
            <div className="client-hero-orb client-hero-orb-one"></div>
            <div className="client-hero-orb client-hero-orb-two"></div>
            <div className="container">
                <div className="client-hero-grid">
                    <div className="client-hero-content">
                        <p className="client-hero-badge">
                            <i className="bi bi-stars"></i>
                            Đồng hành cùng bạn chọn đúng tương lai
                        </p>
                        <h1 className="client-hero-title">
                            Hiểu chính mình.<br />
                            <span>Chọn đúng ngành nghề.</span>
                        </h1>
                        <p className="client-hero-description">
                            Kết nối trực tiếp với chuyên gia giáo dục, khám phá năng lực
                            và xây dựng lộ trình học tập phù hợp dành riêng cho bạn.
                        </p>
                        <div className="client-hero-actions">
                            <Link to="/experts" className="client-btn-primary">
                                Tìm chuyên gia <i className="bi bi-arrow-right"></i>
                            </Link>
                            <Link to="/quiz" className="client-btn-secondary">
                                <i className="bi bi-ui-checks-grid"></i> Làm bài trắc nghiệm
                            </Link>
                        </div>
                        <div className="client-hero-proof">
                            <div className="client-proof-avatars" aria-hidden="true">
                                <span>H</span><span>M</span><span>A</span>
                            </div>
                            <p><strong>Tư vấn 1:1</strong><small>Linh hoạt, bảo mật và chuyên sâu</small></p>
                        </div>
                    </div>

                    <div className="client-hero-visual">
                        <div className="client-hero-image">
                            <img
                                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1000&auto=format&fit=crop"
                                alt="Các bạn trẻ cùng trao đổi về định hướng học tập"
                            />
                        </div>
                        <div className="client-hero-floating-card client-floating-top">
                            <span><i className="bi bi-camera-video-fill"></i></span>
                            <p><strong>Tư vấn trực tuyến</strong><small>Kết nối mọi lúc, mọi nơi</small></p>
                        </div>
                        <div className="client-hero-floating-card client-floating-bottom">
                            <span><i className="bi bi-check2-circle"></i></span>
                            <p><strong>Lộ trình cá nhân</strong><small>Phù hợp với năng lực của bạn</small></p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
