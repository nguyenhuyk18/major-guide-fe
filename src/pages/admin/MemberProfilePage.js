import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getUserById } from '../../services/expert.api';
import '../../assets/css/MemberProfilePage.css';

export default function MemberProfilePage() {
    const { id } = useParams();
    const [member, setMember] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let active = true;
        getUserById(id)
            .then(response => active && setMember(response?.data?.data || null))
            .catch(() => active && setMember(null))
            .finally(() => active && setLoading(false));
        return () => { active = false; };
    }, [id]);

    if (loading) return <div className="admin-member-profile-state"><div className="spinner-border text-primary" /> Đang tải hồ sơ học viên...</div>;
    if (!member) return <div className="admin-member-profile-state"><i className="bi bi-person-x" /><h2>Không tìm thấy học viên</h2><Link to="/admin/messages">Quay lại tin nhắn</Link></div>;

    const avatar = member.fileAvartarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.name || 'M')}&background=3157d5&color=fff&size=256`;

    return (
        <div className="admin-member-profile-page">
            <div className="admin-member-profile-topbar">
                <div><span>Hồ sơ học viên</span><h1>Thông tin người trò chuyện</h1></div>
                <Link to="/admin/messages"><i className="bi bi-arrow-left" /> Quay lại tin nhắn</Link>
            </div>
            <section className="admin-member-profile-card">
                <div className="admin-member-profile-hero">
                    <img src={avatar} alt={member.name || 'Học viên'} />
                    <div><span className={`admin-member-status ${member.statusAccount === 'active' ? 'active' : ''}`}><i />{member.statusAccount === 'active' ? 'Đang hoạt động' : 'Không hoạt động'}</span><h2>{member.name || 'Học viên MajorGuide'}</h2><p>@{member.username || 'member'}</p></div>
                </div>
                <div className="admin-member-profile-grid">
                    <article><i className="bi bi-envelope" /><div><small>Email</small><strong>{member.email || 'Chưa cập nhật'}</strong></div></article>
                    <article><i className="bi bi-person-badge" /><div><small>Vai trò</small><strong>Học viên</strong></div></article>
                    <article><i className="bi bi-calendar3" /><div><small>Tham gia từ</small><strong>{member.createdAt ? new Date(member.createdAt).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}</strong></div></article>
                    <article><i className="bi bi-shield-check" /><div><small>Trạng thái tài khoản</small><strong>{member.statusAccount === 'active' ? 'Đang hoạt động' : (member.statusAccount || 'Chưa cập nhật')}</strong></div></article>
                </div>
                <Link className="admin-member-message-button" to={`/admin/messages?member_id=${id}`}><i className="bi bi-chat-dots-fill" /> Nhắn tin với học viên</Link>
            </section>
        </div>
    );
}
