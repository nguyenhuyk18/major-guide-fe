import React from 'react';
import '../../assets/css/HomePage.css'


export default function HomePage() {
    return (
        <>
            <div className="client-home-page">
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

                {/* Featured Experts Section */}
                <section className="client-section client-experts-section">
                    <div className="container">
                        <div className="client-section-header">
                            <h2 className="client-section-title">Chuyên gia nổi bật</h2>
                            <p className="client-section-subtitle">Đội ngũ có tâm giúp bạn tuyển sinh đại học phù hợp nhất</p>
                            <a href="#" className="client-link-view-all">Xem tất cả →</a>
                        </div>

                        <div className="row g-4">
                            {/* Expert Card 1 */}
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="client-expert-card">
                                    <div className="client-expert-avatar-wrapper">
                                        <img src="https://i.pravatar.cc/150?img=33" alt="Expert" className="client-expert-avatar" />
                                        <span className="client-expert-status"></span>
                                    </div>
                                    <h3 className="client-expert-name">TS. Nguyễn Thu Hà</h3>
                                    <p className="client-expert-major">KHCN-CNTTvàTT</p>
                                    <div className="client-expert-rating">
                                        <i className="bi bi-star-fill"></i>
                                        <span>4.5</span>
                                        <span className="client-expert-reviews">(3.4k đánh giá)</span>
                                    </div>
                                    <p className="client-expert-bio">Chuyên gia lập trình phần mềm và 35 năm kinh nghiệm tư vấn chọn...</p>
                                    <button className="client-btn-expert">
                                        <i className="bi bi-calendar me-2"></i>
                                        Nhắn tin ngay
                                    </button>
                                </div>
                            </div>

                            {/* Expert Card 2 */}
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="client-expert-card">
                                    <div className="client-expert-avatar-wrapper client-avatar-purple">
                                        <span className="client-expert-initial">M</span>
                                        <span className="client-expert-status client-status-offline"></span>
                                    </div>
                                    <h3 className="client-expert-name">ThS. Lê Minh</h3>
                                    <p className="client-expert-major">KHXH-GIAO DUC</p>
                                    <div className="client-expert-rating">
                                        <i className="bi bi-star-fill"></i>
                                        <span>4.8</span>
                                        <span className="client-expert-reviews">(9.5k đánh giá)</span>
                                    </div>
                                    <p className="client-expert-bio">Giảng viên Đại học Sư phạm Hà Nội là triết học chủ đề Rust.</p>
                                    <button className="client-btn-expert client-btn-expert-outline">
                                        <i className="bi bi-calendar me-2"></i>
                                        Đặt lịch hẹn
                                    </button>
                                </div>
                            </div>

                            {/* Expert Card 3 */}
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="client-expert-card">
                                    <div className="client-expert-avatar-wrapper client-avatar-blue">
                                        <span className="client-expert-initial">T</span>
                                        <span className="client-expert-status"></span>
                                    </div>
                                    <h3 className="client-expert-name">Trần Tuấn Anh</h3>
                                    <p className="client-expert-major">KHCN-CNTT</p>
                                    <div className="client-expert-rating">
                                        <i className="bi bi-star-fill"></i>
                                        <span>5.0</span>
                                        <span className="client-expert-reviews">(4.2k đánh giá)</span>
                                    </div>
                                    <p className="client-expert-bio">Senior Developer tại Google, Chuyên về Software, mentor định hướng...</p>
                                    <button className="client-btn-expert">
                                        <i className="bi bi-calendar me-2"></i>
                                        Nhắn tin ngay
                                    </button>
                                </div>
                            </div>

                            {/* Expert Card 4 */}
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="client-expert-card">
                                    <div className="client-expert-avatar-wrapper client-avatar-orange">
                                        <span className="client-expert-initial">H</span>
                                        <span className="client-expert-status"></span>
                                    </div>
                                    <h3 className="client-expert-name">Hoàng Lan</h3>
                                    <p className="client-expert-major">DU-NGSC</p>
                                    <div className="client-expert-rating">
                                        <i className="bi bi-star-fill"></i>
                                        <span>4.8</span>
                                        <span className="client-expert-reviews">(5.8k đánh giá)</span>
                                    </div>
                                    <p className="client-expert-bio">Cựu du học sinh Úc, chuyên về học bổng và visa du học.</p>
                                    <button className="client-btn-expert">
                                        <i className="bi bi-calendar me-2"></i>
                                        Nhắn tin ngay
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Universities and Majors Section */}
                <section className="client-section">
                    <div className="container">
                        <div className="row g-4">
                            {/* Universities */}
                            <div className="col-12 col-lg-7">
                                <div className="client-subsection-header">
                                    <h2 className="client-subsection-title">Các trường đại học hàng đầu</h2>
                                    <a href="#" className="client-link-small">Xem thêm →</a>
                                </div>
                                <div className="row g-3">
                                    <div className="col-12 col-md-6">
                                        <div className="client-university-card">
                                            <img src="https://via.placeholder.com/400x200/3b82f6/ffffff?text=University" alt="University" className="client-university-img" />
                                            <div className="client-university-badge">4.6</div>
                                            <div className="client-university-info">
                                                <h4>Đại học Quốc Gia Hà Nội</h4>
                                                <p><i className="bi bi-geo-alt"></i> Hà Nội</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="client-university-card">
                                            <img src="https://via.placeholder.com/400x200/f59e0b/ffffff?text=University" alt="University" className="client-university-img" />
                                            <div className="client-university-badge">4.7</div>
                                            <div className="client-university-info">
                                                <h4>Đại học RMIT Việt Nam</h4>
                                                <p><i className="bi bi-geo-alt"></i> HCM & Hà Nội</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Hot Majors */}
                            <div className="col-12 col-lg-5">
                                <div className="client-subsection-header">
                                    <h2 className="client-subsection-title">Ngành học HOT</h2>
                                    <a href="#" className="client-link-small">Tất cả →</a>
                                </div>
                                <div className="client-major-list">
                                    <div className="client-major-item">
                                        <div className="client-major-icon client-icon-blue">
                                            <i className="bi bi-laptop"></i>
                                        </div>
                                        <div className="client-major-content">
                                            <h4>CNTT & Lập trình</h4>
                                            <p>8 trường liên kết</p>
                                        </div>
                                        <i className="bi bi-chevron-right"></i>
                                    </div>
                                    <div className="client-major-item">
                                        <div className="client-major-icon client-icon-green">
                                            <i className="bi bi-graph-up-arrow"></i>
                                        </div>
                                        <div className="client-major-content">
                                            <h4>Digital Marketing</h4>
                                            <p>6 trường liên kết</p>
                                        </div>
                                        <i className="bi bi-chevron-right"></i>
                                    </div>
                                    <div className="client-major-item">
                                        <div className="client-major-icon client-icon-purple">
                                            <i className="bi bi-palette"></i>
                                        </div>
                                        <div className="client-major-content">
                                            <h4>Thiết kế đồ họa</h4>
                                            <p>4 trường liên kết</p>
                                        </div>
                                        <i className="bi bi-chevron-right"></i>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Recent Articles Section */}
                <section className="client-section">
                    <div className="container">
                        <div className="client-section-header">
                            <h2 className="client-section-title">Bài viết gần đây</h2>
                            <a href="#" className="client-link-view-all">Xem tất cả →</a>
                        </div>
                        <div className="row g-4">
                            <div className="col-12 col-md-4">
                                <div className="client-article-card">
                                    <div className="client-article-image">
                                        <img src="https://via.placeholder.com/400x250/6366f1/ffffff?text=Article" alt="Article" />
                                        <span className="client-article-badge">TUYỂN SINH</span>
                                    </div>
                                    <div className="client-article-content">
                                        <p className="client-article-date"><i className="bi bi-calendar3"></i> 12/05/2024</p>
                                        <h3 className="client-article-title">Công bố phương án tuyển sinh đại học chính quy năm 2024</h3>
                                        <p className="client-article-excerpt">Nhiều trường đại học top đầu đã công bố phương án tuyển sinh năm 2024 cho các sinh viên muốn theo đuổi tại Việt...</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="client-article-card">
                                    <div className="client-article-image">
                                        <img src="https://via.placeholder.com/400x250/10b981/ffffff?text=Article" alt="Article" />
                                        <span className="client-article-badge client-badge-green">HƯỚNG NGHIỆP</span>
                                    </div>
                                    <div className="client-article-content">
                                        <p className="client-article-date"><i className="bi bi-calendar3"></i> 10/05/2024</p>
                                        <h3 className="client-article-title">Top 5 ngành nghề có thu nhập hấp dẫn trong 5 năm tới</h3>
                                        <p className="client-article-excerpt">Xu hướng chuyên đổi số đang làm ra tiền việc làm cao thu nhập ngành công nghệ và đầu tức...</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-4">
                                <div className="client-article-card">
                                    <div className="client-article-image">
                                        <img src="https://via.placeholder.com/400x250/ec4899/ffffff?text=Article" alt="Article" />
                                        <span className="client-article-badge client-badge-pink">TÂM LÝ HỌC</span>
                                    </div>
                                    <div className="client-article-content">
                                        <p className="client-article-date"><i className="bi bi-calendar3"></i> 05/05/2024</p>
                                        <h3 className="client-article-title">Bí quyết quản lý tài chính hiệu quả cho tân sinh viên</h3>
                                        <p className="client-article-excerpt">Làm thế nào để chi tiêu hợp lý và tiết kiệm là vấn đề đáng quan tâm của nhiều sinh viên mới và HSSV? Cùng tìm...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Discussion Forum Section */}
                <section className="client-section client-forum-section">
                    <div className="container">
                        <div className="client-forum-header">
                            <div className="client-forum-icon">
                                <i className="bi bi-chat-left-text"></i>
                            </div>
                            <div>
                                <h2 className="client-forum-title">Thảo luận cộng đồng</h2>
                                <p className="client-forum-subtitle">Kết nối học viện hỏi đáp những chung cộng đồng học sinh toàn quốc</p>
                            </div>
                        </div>

                        <div className="client-forum-thread">
                            <div className="client-thread-header">
                                <div className="client-thread-avatar">
                                    <img src="https://i.pravatar.cc/40?img=1" alt="User" />
                                </div>
                                <div className="client-thread-info">
                                    <h4>Hỏi đáp Tuyển sinh 2024</h4>
                                    <p><i className="bi bi-people"></i> 1,245 thành viên online</p>
                                </div>
                                <div className="client-thread-actions">
                                    <button className="client-btn-icon"><i className="bi bi-search"></i></button>
                                    <button className="client-btn-icon"><i className="bi bi-three-dots-vertical"></i></button>
                                </div>
                            </div>

                            <div className="client-forum-messages">
                                {/* Message 1 - Original question */}
                                <div className="client-msg-item">
                                    <div className="client-msg-avatar">
                                        <div className="client-avatar-initial client-bg-gray">H</div>
                                    </div>
                                    <div className="client-msg-body">
                                        <div className="client-msg-header">
                                            <span className="client-msg-name">Hoàng Nam</span>
                                            <span className="client-msg-time">Hôm nay lúc 10:30 h</span>
                                        </div>
                                        <div className="client-msg-content">
                                            Mọi người cho mình hỏi ngành Marketing của NEU thì mỗi năm tuyển sinh cây bao nhiêu điểm vào để Minh có dự x
                                        </div>
                                        <button className="client-msg-reply-btn">Trả lời</button>
                                    </div>
                                </div>

                                <div className="client-msg-item">
                                    <div className="client-msg-avatar">
                                        <div className="client-avatar-initial client-bg-gray">H</div>
                                    </div>
                                    <div className="client-msg-body">
                                        <div className="client-msg-header">
                                            <span className="client-msg-name">Hoàng Nam</span>
                                            <span className="client-msg-time">Hôm nay lúc 10:30 h</span>
                                        </div>
                                        <div className="client-msg-content">
                                            Mọi người cho mình hỏi ngành Marketing của NEU thì mỗi năm tuyển sinh cây bao nhiêu điểm vào để Minh có dự x
                                        </div>
                                        <button className="client-msg-reply-btn">Trả lời</button>
                                    </div>
                                </div>


                                <div className="client-msg-item">
                                    <div className="client-msg-avatar">
                                        <div className="client-avatar-initial client-bg-gray">H</div>
                                    </div>
                                    <div className="client-msg-body">
                                        <div className="client-msg-header">
                                            <span className="client-msg-name">Hoàng Nam</span>
                                            <span className="client-msg-time">Hôm nay lúc 10:30 h</span>
                                        </div>
                                        <div className="client-msg-content">
                                            Mọi người cho mình hỏi ngành Marketing của NEU thì mỗi năm tuyển sinh cây bao nhiêu điểm vào để Minh có dự x
                                        </div>
                                        <button className="client-msg-reply-btn">Trả lời</button>
                                    </div>
                                </div>

                                {/* Message 2 - Reply */}
                                <div className="client-msg-item client-msg-reply">
                                    <div className="client-msg-avatar">
                                        <div className="client-avatar-initial client-bg-blue">N</div>
                                    </div>
                                    <div className="client-msg-body">
                                        <div className="client-msg-header">
                                            <span className="client-msg-name">Hoàng Nam</span>
                                            <span className="client-msg-badge">Phả lời</span>
                                        </div>

                                        {/* Show original message */}
                                        <div className="client-msg-replied">
                                            <div className="client-replied-author">Hoàng Nam</div>
                                            <div className="client-replied-text">Mọi người cho mình hỏi ngành Marketing của NEU...</div>
                                        </div>

                                        <div className="client-msg-content">
                                            PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên! PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên!                                            PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên!                                            PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên!                                            PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên!
                                        </div>

                                    </div>
                                </div>

                                <div className="client-msg-item client-msg-reply">
                                    <div className="client-msg-avatar">
                                        {/* <div className="client-avatar-initial client-bg-blue"> */}
                                        <img src="https://res.cloudinary.com/dszzlhs5i/image/upload/v1767619633/major-guide-app/hankschrader.jpg" className='client-avatar-photo' alt="" />
                                        {/* </div> */}
                                    </div>
                                    <div className="client-msg-body">

                                        <div className="client-msg-content">
                                            PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên! PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên!                                            PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên!                                            PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên!                                            PM người gia mình hỏi ngành Marketing của NEU. Năm ngành nói năm ngoái là 912.5 cầu năm của ngành lầm độ học nhịch hôn sùi thú, Có thể lên!
                                        </div>

                                    </div>
                                </div>

                                {/* Message 3 - Expert answer */}
                                <div className="client-msg-item">
                                    <div className="client-msg-avatar">
                                        <img src="https://i.pravatar.cc/40?img=2" alt="Expert" className="client-avatar-photo" />
                                    </div>
                                    <div className="client-msg-body">
                                        <div className="client-msg-header">
                                            <span className="client-msg-name">TS. Nguyễn Thu Hà</span>
                                            <span className="client-msg-badge client-badge-expert">Chuyên gia</span>
                                            <span className="client-msg-time">10:32 H</span>
                                        </div>
                                        <div className="client-msg-content">
                                            Chào các em, với phức đều năm may, về tú kiểu câm nghiệp kinh tế trợ phải về gộ đó cỡ cả để dinh học nhiệc thẳng thể 3.25-0.5 điểm mọc Các em hãy có phương án đó phụng thể ở trường Thọ 2.
                                        </div>
                                        <button className="client-msg-reply-btn">Trả lời</button>
                                    </div>
                                </div>

                                {/* Message 4 - Another reply */}
                                <div className="client-msg-item client-msg-reply">
                                    <div className="client-msg-avatar">
                                        <div className="client-avatar-initial client-bg-purple">L</div>
                                    </div>
                                    <div className="client-msg-body">
                                        <div className="client-msg-header">
                                            <span className="client-msg-name">Lan Anh</span>
                                            <span className="client-msg-badge">Phả lời</span>
                                        </div>

                                        {/* Show original message */}
                                        <div className="client-msg-replied">
                                            <div className="client-replied-author">Hoàng Nam</div>
                                            <div className="client-replied-text">Mọi người cho mình hỏi ngành Marketing của NEU...</div>
                                        </div>

                                        <div className="client-msg-content">
                                            Mình nghe nói năm nay điểm chuẩn có thể tăng đấy bạn, nên chuẩn bị thật tốt nhé!
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="client-forum-input">
                                <div className="client-input-wrapper">
                                    <input type="text" className="client-input-message" placeholder="Nhập tin nhắn của bạn..." />
                                    <button className="client-btn-emoji"><i className="bi bi-emoji-smile"></i></button>
                                </div>
                                <button className="client-btn-send"><i className="bi bi-send-fill"></i></button>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
