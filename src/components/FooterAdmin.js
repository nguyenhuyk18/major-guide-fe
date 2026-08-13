// import React from 'react';
import '../assets/css/FooterAdmin.css'

export default function FooterAdmin() {
    return (
        <>
            <footer className="admin-footer">
                <div className="container-fluid">
                    <div className="row align-items-center">

                        <div className="col-md-6 text-center text-md-start mb-2 mb-md-0">
                            <p className="mb-0 text-secondary fs-7">
                                © {new Date().getFullYear()} <span className="text-white fw-semibold">MajorGuide</span>.
                                <span className="d-none d-sm-inline"> Expert workspace.</span>
                            </p>
                        </div>

                        {/* <div class="col-md-6 text-center text-md-end">
                            <ul class="list-inline mb-0">
                                <li class="list-inline-item mx-2">
                                    <a href="/" class="footer-link">Điều khoản</a>
                                </li>
                                <li class="list-inline-item mx-2">
                                    <a href="/" class="footer-link">Bảo mật</a>
                                </li>
                                <li class="list-inline-item mx-2">
                                    <a href="/" class="footer-link">Hỗ trợ</a>
                                </li>
                                <li class="list-inline-item border-start border-secondary ps-3 ms-2">
                                    <span class="text-secondary small">v1.0.0</span>
                                </li>
                            </ul>
                        </div> */}

                    </div>
                </div>
            </footer>

        </>
    );
}
