import React from 'react';

export default function HeroSection() {
    return (
        <>

            {/* Hero Section */}
            <section className="client-hero-section">
                <div className="client-hero-overlay"></div>
                <div className="container">
                    <div className="client-hero-content">
                        <p className="client-hero-badge">Nền tảng dạy và học trực tuyến</p>
                        <h1 className="client-hero-title">
                            Kết nối chuyên gia<br />
                            Định hướng tương lai
                        </h1>
                        <p className="client-hero-description">
                            Nền tảng tư vấn trực tuyến hàng đầu giúp bạn chọn đúng ngành, đúng<br />
                            trường. Chat trực tiếp với anh viên và chuyên gia ngay hôm nay.
                        </p>
                        <div className="client-hero-actions">
                            <button className="client-btn-primary">
                                Tham gia nền tảng ngay
                            </button>
                            <button className="client-btn-secondary">
                                Tìm hiểu thêm
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
