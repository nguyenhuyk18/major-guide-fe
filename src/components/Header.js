import '../assets/css/Header.css'

export default function Header() {
    return (
        <>
            <header className="client-header">
                <div className="container">
                    <div className="client-header-content">
                        {/* Logo */}
                        <div className="client-logo">
                            <div className="client-logo-icon">
                                <i className="bi bi-mortarboard-fill"></i>
                            </div>
                            <span className="client-logo-text">EduGuide</span>
                        </div>

                        {/* Navigation */}
                        <nav className="client-nav">
                            <a href="#" className="client-nav-link active">Trang chủ</a>
                            <a href="#" className="client-nav-link">Chuyên gia</a>
                            <a href="#" className="client-nav-link">Đại học</a>
                            <a href="#" className="client-nav-link">Tra Noc</a>
                            <a href="#" className="client-nav-link">Liên hệ</a>
                        </nav>

                        {/* Actions */}
                        <div className="client-header-actions">
                            <button className="client-btn-login">Đăng ký</button>
                        </div>
                    </div>
                </div>
            </header>
        </>
    );
}
