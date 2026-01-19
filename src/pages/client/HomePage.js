import React from 'react';
import '../../assets/css/HomePage.css'
import HeroSection from '../../components/client/HeroSection';
import ChatCommunity from '../../components/client/ChatCommunity';
import { Link } from 'react-router-dom';


export default function HomePage() {
    return (
        <>
            <div className="client-home-page">

                <HeroSection></HeroSection>



                {/* Featured Experts Section */}
                <section className="client-section client-experts-section">
                    <div className="container">
                        <div className="client-section-header">
                            <h2 className="client-section-title">Chuyên gia nổi bật</h2>
                            <p className="client-section-subtitle">Đội ngũ có tâm giúp bạn tuyển sinh đại học phù hợp nhất</p>
                            <Link className="client-link-view-all">Xem tất cả →</Link>
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
                                    <Link className="client-link-small">Xem thêm →</Link>
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
                                    <Link className="client-link-small">Tất cả →</Link>
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
                            <Link href="#" className="client-link-view-all">Xem tất cả →</Link>
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
                <ChatCommunity />
            </div>
        </>
    );
}
