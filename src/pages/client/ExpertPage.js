import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/css/ExpertPage.css';
import { getListUser } from '../../services/user-access.api';

const LIMIT = 6;

export default function ExpertPage() {
    const [experts, setExperts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [searchName, setSearchName] = useState('');
    console.log('áhjkdguyasgduyasgfyutidasgfit')
    // Debounce 500ms
    const debounceRef = useRef(null);
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchInput(value);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            setPage(1);
            setSearchName(value);
        }, 500);
    };

    useEffect(() => {
        const fetchExperts = async () => {
            setLoading(true);
            try {
                const rs = await getListUser(page, 'active', searchName, LIMIT, '', 'expert');
                // console.log(rs);
                const data = rs?.data?.data || {};
                setExperts(data?.result || []);
                setTotalPage(data?.totalPage || 1);
            } catch (err) {
                console.error('Lỗi tải danh sách chuyên gia:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExperts();
    }, [page, searchName]);

    const handlePageChange = (p) => {
        if (p < 1 || p > totalPage) return;
        setPage(p);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <>
            <div className="client-home-page">
                {/* Hero Section */}
                <section className="expert-hero-section">
                    <div className="container">
                        <h1 className="expert-hero-title">Danh sách Chuyên gia</h1>
                        <p className="expert-hero-subtitle">
                            Kết nối với những cố vấn hàng đầu để định hướng tương lai học thuật và nghề nghiệp của bạn.
                            Tìm người hướng dẫn hoàn hảo cho hành trình của mình.
                        </p>
                    </div>
                </section>

                {/* Search Filter Section */}
                <section className="expert-filter-section">
                    <div className="container">
                        <div className="expert-filter-wrapper">
                            {/* Search Input */}
                            <div className="expert-filter-item">
                                <label className="expert-filter-label">TÌM KIẾM</label>
                                <div className="expert-search-box">
                                    <i className="bi bi-search"></i>
                                    <input
                                        type="text"
                                        className="expert-search-input"
                                        placeholder="Tìm tên chuyên gia hoặc từ khóa..."
                                        value={searchInput}
                                        onChange={handleSearchChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Expert Cards Grid */}
                <section className="expert-cards-section">
                    <div className="container">

                        {/* Loading */}
                        {loading && (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Đang tải...</span>
                                </div>
                            </div>
                        )}

                        {/* Empty */}
                        {!loading && experts.length === 0 && (
                            <div className="text-center py-5 text-muted">
                                <i className="bi bi-person-x fs-1 d-block mb-3"></i>
                                <p>Không tìm thấy chuyên gia{searchName ? ` khớp với "${searchName}"` : ''}.</p>
                            </div>
                        )}

                        {/* Cards */}
                        {!loading && experts.length > 0 && (
                            <div className="row g-4">
                                {experts.map((expert) => (
                                    <div key={expert._id} className="col-12 col-md-6 col-lg-4">
                                        <div className="expert-card">
                                            <div className="expert-card-header">
                                                <div className="expert-avatar-wrapper">
                                                    <img
                                                        src={expert.fileAvartarUrl || `https://i.pravatar.cc/150?u=${expert._id}`}
                                                        alt={expert.name}
                                                        className="expert-avatar"
                                                    />
                                                    <span className="expert-online-badge"></span>
                                                </div>
                                                <span className="expert-degree-badge">{expert.expertProfile?.level?.toUpperCase() || 'CHUYÊN GIA'}</span>
                                            </div>
                                            <h3 className="expert-card-name">{expert.name}</h3>
                                            <p className="expert-card-major">{expert.expertProfile?.major || '—'}</p>
                                            <p className="expert-card-bio">{expert.expertProfile?.information || 'Chưa có thông tin.'}</p>
                                            <div className="expert-card-actions">
                                                <Link to={`/choose-schedule?expert_id=${expert._id}`} className="expert-btn-book">Đặt lịch</Link>
                                                <Link className="expert-btn-detail">Xem chi tiết</Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && totalPage > 1 && (
                            <nav className="expert-pagination">
                                <ul className="pagination justify-content-center align-items-center">
                                    <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(page - 1)}>
                                            <i className="bi bi-chevron-left"></i>
                                        </button>
                                    </li>
                                    <li className="page-item disabled">
                                        <span className="page-link text-dark fw-semibold">Trang {page} / {totalPage}</span>
                                    </li>
                                    <li className={`page-item ${page === totalPage ? 'disabled' : ''}`}>
                                        <button className="page-link" onClick={() => handlePageChange(page + 1)}>
                                            <i className="bi bi-chevron-right"></i>
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        )}
                    </div>
                </section>
            </div>
        </>
    );
}
