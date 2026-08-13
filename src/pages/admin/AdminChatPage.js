import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import '../../assets/css/AdminAIChat.css';
import { sendChatAiMessage } from '../../services/chatai.api';

// ===================== AI RESPONSES =====================
// const RESPONSES = {
//     dashboard: `## 📊 Dashboard Overview

// Các chỉ số chính cần theo dõi:

// | Metric | Mô tả | Ngưỡng cảnh báo |
// |--------|--------|------------------|
// | 👥 Users | Tổng người dùng đăng ký | Giảm > 20% |
// | 📅 Bookings | Lịch tư vấn trong ngày | > 50 lịch/ngày |
// | 💰 Revenue | Doanh thu từ dịch vụ | Dưới kỳ vọng |
// | ⭐ Rating | Điểm đánh giá TB | < 4.0 sao |

// > **Tip:** Theo dõi biểu đồ xu hướng tuần để phát hiện bất thường sớm nhất có thể.`,

//     expert: `## 👨‍🏫 Quản lý Chuyên gia

// ### Tạo chuyên gia mới

// \`\`\`javascript
// {
//   name: "Nguyễn Văn A",
//   email: "expert@example.com",
//   phone: "0912xxxxxx",
//   expertise: ["Career", "Skills"],
//   bio: "Giới thiệu bản thân...",
//   avatar: File
// }
// \`\`\`

// ### Các thao tác có thể thực hiện:

// - ✅ **Duyệt / Xóa** chuyên gia mới đăng ký
// - 📝 **Chỉnh sửa** thông tin hồ sơ
// - 📅 **Quản lý lịch** làm việc
// - 📊 **Xem thống kê** lịch hẹn của từng chuyên gia`,

//     booking: `## 📅 Quản lý Lịch đặt

// ### Trạng thái đơn đặt:

// | Code | Trạng thái | Màu |
// |------|-------------|------|
// | 🟡 PENDING | Chờ xác nhận | Vàng |
// | 🟢 CONFIRMED | Đã xác nhận | Xanh |
// | 🔵 IN_PROGRESS | Đang diễn ra | Xanh dương |
// | ✅ COMPLETED | Hoàn thành | Xanh lá |
// | 🔴 CANCELLED | Đã hủy | Đỏ |

// ### Chính sách hủy lịch:

// - **Hủy trước 24h:** Hoàn tiền 100%
// - **Hủy trong 24h:** Không hoàn tiền`,

//     report: `## 📊 Báo cáo & Thống kê

// ### Các loại báo cáo:

// **1. Theo ngày / tuần / tháng**
// - Tổng số lịch hẹn
// - Doanh thu chi tiết từng dịch vụ
// - Top chuyên gia được đặt nhiều nhất

// **2. Báo cáo người dùng**

// \`\`\`json
// {
//   "totalUsers": 1234,
//   "newThisMonth": 89,
//   "activeUsers": 456,
//   "churnRate": "2.3%"
// }
// \`\`\`

// **3. Hiệu suất chuyên gia**
// - Số giờ tư vấn trung bình
// - Điểm đánh giá TB
// - Tỷ lệ hủy lịch`,

//     post: `## ✍️ Quản lý Blog

// ### Tạo bài viết mới:

// \`\`\`javascript
// {
//   title: "5 Kỹ Năng Giao Tiếp",
//   slug: "5-ky-nang-giao-tiep",
//   content: "<p>HTML content...</p>",
//   excerpt: "Tóm tắt SEO...",
//   thumbnail: "url",
//   category: "ky-nang-song",
//   tags: ["giao tiep", "ky nang"],
//   status: "published"
// }
// \`\`\`

// ### Rich Text Editor hỗ trợ:

// - Heading, Bold, Italic
// - Danh sách (bullet, numbered)
// - Chèn ảnh, Video
// - Code block với syntax highlighting
// - Link, Quote, Table`,

//     payment: `## 💳 Thanh toán

// ### Các phương thức được hỗ trợ:

// | Phương thức | Phí | Thời gian |
// |-------------|-----|-----------|
// | 💳 ATM/Visa | 2.5% | Tức thì |
// | 📱 VNPay | 2.5% | 1-5 phút |
// | 🏦 Chuyển khoản | Miễn phí | 1-24h |
// | 💵 Tiền mặt | Miễn phí | Khi đến |

// ### Luồng thanh toán:

// \`\`\`
// PENDING → PROCESSING → SUCCESS → COMPLETED
//                 ↓
//              FAILED
// \`\`\`

// ### Xử lý Refund:

// 1. Mở **Quản lý đơn hàng**
// 2. Chọn đơn → nhấn **"Hoàn tiền"**
// 3. Xác nhận → tiền về trong 3-7 ngày`,

//     user: `## 👥 Quản lý Người dùng

// ### Phân quyền:

// | Vai trò | Quyền hạn |
// |---------|-----------|
// | 👑 Admin | Toàn quyền hệ thống |
// | 👨‍🏫 Expert | Quản lý lịch & hồ sơ cá nhân |
// | 👤 Client | Đặt lịch, xem blog, đánh giá |

// ### Tính năng quản lý:

// - 🔍 **Tìm kiếm & lọc** theo tên, email, vai trò
// - 📋 **Xem lịch sử hoạt động** từng người dùng
// - 🚫 **Khóa / Mở khóa** tài khoản vi phạm
// - 📊 **Export danh sách** (Excel/CSV)
// - 📧 **Gửi email** thông báo hàng loạt`,

//     settings: `## ⚙️ Cài đặt Hệ thống

// ### 1. Cài đặt chung
// - **Tên website:** MajorGuide
// - **Logo & Favicon**
// - **Thông tin liên hệ** (email, hotline)
// - **Mạng xã hội**

// ### 2. Cài đặt lịch tư vấn

// \`\`\`yaml
// consultation:
//   minDuration: 30min
//   maxDuration: 120min
//   bufferTime: 15min
//   advanceBookingDays: 30
//   cancelPolicy:
//     freeHours: 24
//     refundRate: 100
// \`\`\`

// ### 3. Bảo mật
// - **2FA** cho tài khoản admin
// - **Session timeout** tự động
// - **IP whitelist** cho backend`,

//     default: `Xin chào! 👋 Tôi là **AI Assistant** của MajorGuide Admin.

// Tôi có thể hỗ trợ bạn về:

// 🗂️ **Người dùng** — Thêm, sửa, phân quyền tài khoản
// 📅 **Lịch hẹn** — Duyệt, xử lý, thống kê đơn đặt
// 👨‍🏫 **Chuyên gia** — Tạo, cập nhật hồ sơ chuyên gia
// ✍️ **Blog** — Viết bài, xuất bản, quản lý nội dung
// 💳 **Thanh toán** — Theo dõi, xử lý refund
// 📊 **Báo cáo** — Thống kê, biểu đồ, xuất dữ liệu
// ⚙️ **Cài đặt** — Cấu hình hệ thống

// Bạn cần hỗ trợ gì hôm nay?`
// };

// const WELCOME_MSG = {
//     id: 'wmsg',
//     role: 'assistant',
//     content: RESPONSES.default,
//     time: new Date()
// };

// const DEFAULT_CHAT = {
//     id: 'default',
//     title: 'AI Assistant',
//     messages: [WELCOME_MSG],
//     createdAt: new Date()
// };

const PROMPTS = [
    { id: 'dashboard', iconClass: 'is-blue', icon: 'bi bi-graph-up', title: 'Phân tích Dashboard', desc: 'Tổng quan các chỉ số và xu hướng' },
    { id: 'expert', iconClass: 'is-purple', icon: 'bi bi-person-badge', title: 'Quản lý Chuyên gia', desc: 'Hướng dẫn thêm và quản lý hồ sơ' },
    { id: 'report', iconClass: 'is-green', icon: 'bi bi-file-earmark-bar-graph', title: 'Báo cáo & Thống kê', desc: 'Xuất báo cáo và phân tích dữ liệu' },
    { id: 'booking', iconClass: 'is-orange', icon: 'bi bi-calendar-check', title: 'Xử lý Lịch hẹn', desc: 'Quy trình duyệt và quản lý đơn đặt' },
];

// ===================== HELPERS =====================
// const getResponse = (q) => {
//     const lq = q.toLowerCase();
//     if (lq.includes('dashboard') || lq.includes('tổng quan') || lq.includes('thống kê') || lq.includes('chỉ số')) return RESPONSES.dashboard;
//     if (lq.includes('chuyên gia') || lq.includes('expert') || lq.includes('thêm chuyên')) return RESPONSES.expert;
//     if (lq.includes('báo cáo') || lq.includes('report')) return RESPONSES.report;
//     if (lq.includes('lịch') || lq.includes('đặt lịch') || lq.includes('booking') || lq.includes('hủy')) return RESPONSES.booking;
//     if (lq.includes('blog') || lq.includes('bài viết') || lq.includes('post')) return RESPONSES.post;
//     if (lq.includes('thanh toán') || lq.includes('payment') || lq.includes('refund') || lq.includes('hoàn')) return RESPONSES.payment;
//     if (lq.includes('người dùng') || lq.includes('user') || lq.includes('client') || lq.includes('quyền')) return RESPONSES.user;
//     if (lq.includes('cài đặt') || lq.includes('settings') || lq.includes('config')) return RESPONSES.settings;
//     return RESPONSES.default;
// };

const fmtTime = (d) => d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

// ===================== EXPERT CARD RENDERER =====================
const ExpertCardAdmin = ({ expert }) => {
    const LEVEL_STYLES = {
        'Cử nhân':    { bg: '#dbeafe', text: '#1d4ed8', border: '#bfdbfe' },
        'Thạc sĩ':    { bg: '#ede9fe', text: '#7c3aed', border: '#ddd6fe' },
        'Tiến sĩ':    { bg: '#fef9c3', text: '#854d0e', border: '#fde68a' },
        'Giáo sư':    { bg: '#d1fae5', text: '#065f46', border: '#a7f3d0' },
    };
    const STATUS_COLORS = { active: '#10b981', busy: '#f59e0b', down: '#ef4444' };

    const ls = LEVEL_STYLES[expert.level] || LEVEL_STYLES['Cử nhân'];
    const statusColor = STATUS_COLORS[expert.status] || STATUS_COLORS.active;

    const fmtPrice = (p) => {
        if (!p && p !== 0) return 'Liên hệ';
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(p);
    };

    return (
        <div className="aichat-expert-card">
            <div className="aichat-expert-card-top">
                <img
                    src={expert.avatar || 'https://res.cloudinary.com/dszzlhs5i/image/upload/v1765722730/avatar-mac-dinh-4-2_x3xl1f.jpg'}
                    alt={expert.name}
                    className="aichat-expert-avatar"
                    onError={e => { e.target.src = 'https://res.cloudinary.com/dszzlhs5i/image/upload/v1765722730/avatar-mac-dinh-4-2_x3xl1f.jpg'; }}
                />
                <div className="aichat-expert-meta">
                    <div className="aichat-expert-name">{expert.name}</div>
                    <div className="aichat-expert-major">{expert.major}</div>
                    <span className="aichat-expert-level" style={{ background: ls.bg, color: ls.text, borderColor: ls.border }}>
                        {expert.level}
                    </span>
                </div>
                <span className="aichat-expert-status" style={{ background: statusColor }} title={expert.status} />
            </div>
            {expert.teachAt && expert.teachAt !== 'Không rõ' && (
                <div className="aichat-expert-row">
                    <i className="bi bi-geo-alt-fill" />
                    <span>{expert.teachAt}</span>
                </div>
            )}
            {expert.information && (
                <div className="aichat-expert-bio">{expert.information}</div>
            )}
            {/* <div className="aichat-expert-footer">
                <span className="aichat-expert-price">{fmtPrice(expert.price)}</span>
                <a href={`mailto:${expert.email}`} className="aichat-expert-btn">
                    <i className="bi bi-envelope-fill" /> Liên hệ
                </a>
            </div> */}
        </div>
    );
};

// ===================== MARKDOWN RENDERER =====================
const parse = (content) => {
    const lines = content.split('\n');
    const out = [];
    let inCode = false, codeLang = '', codeBody = '', tableRows = [];

    lines.forEach((line, i) => {
        if (line.trim().startsWith('```')) {
            if (!inCode) { inCode = true; codeLang = line.trim().slice(3).trim() || 'code'; codeBody = ''; }
            else { inCode = false; out.push({ type: 'code', lang: codeLang, content: codeBody.trim(), key: `c${i}` }); }
            return;
        }
        if (inCode) { codeBody += line + '\n'; return; }

        if (line.includes('|') && line.trim().startsWith('|')) {
            const cells = line.split('|').map(c => c.trim());
            if (cells.every(c => /^[-:]+$/.test(c))) return;
            tableRows.push(cells);
            return;
        } else if (tableRows.length > 0) {
            out.push({ type: 'table', rows: [...tableRows], key: `t${i}` });
            tableRows = [];
        }

        if (!line.trim()) { out.push({ type: 'br', key: `b${i}` }); return; }
        if (line.startsWith('## ')) { out.push({ type: 'h3', content: line.slice(3), key: `h3${i}` }); return; }
        if (line.startsWith('### ')) { out.push({ type: 'h4', content: line.slice(4), key: `h4${i}` }); return; }
        if (line.startsWith('> ')) { out.push({ type: 'quote', content: line.slice(2), key: `q${i}` }); return; }
        if (line.match(/^[-*] /)) { out.push({ type: 'li', content: line.slice(2), key: `li${i}` }); return; }
        out.push({ type: 'p', content: line, key: `p${i}` });
    });

    if (tableRows.length > 0) out.push({ type: 'table', rows: [...tableRows], key: 'tend' });
    return out;
};

const renderInline = (text) => {
    const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('`') && part.endsWith('`')) return <code key={i}>{part.slice(1, -1)}</code>;
        if (part.startsWith('**') && part.endsWith('**')) return <strong key={i}>{part.slice(2, -2)}</strong>;
        return part;
    });
};

const renderContent = (content) => {
    const els = parse(content);
    let buf = [];

    const flush = () => {
        if (buf.length === 0) return null;
        const items = [...buf];
        buf = [];
        return (
            <ul key={`ul-${items[0].key}`} style={{ margin: '6px 0', paddingLeft: '22px' }}>
                {items.map(item => <li key={item.key} style={{ margin: '3px 0' }}>{renderInline(item.content)}</li>)}
            </ul>
        );
    };

    return (
        <>
            {els.map(el => {
                switch (el.type) {
                    case 'code':
                        return (
                            <div className="aichat-code-block" key={el.key}>
                                <div className="aichat-code-header">
                                    <span className="aichat-code-lang">{el.lang}</span>
                                    <button className="aichat-code-copy" onClick={() => navigator.clipboard.writeText(el.content)}>
                                        <i className="bi bi-clipboard" /> Copy
                                    </button>
                                </div>
                                <pre><code>{el.content}</code></pre>
                            </div>
                        );
                    case 'table':
                        return (
                            <div key={el.key} style={{ overflowX: 'auto' }}>
                                <table>
                                    <thead><tr>{el.rows[0].map((c, i) => <th key={i}>{renderInline(c)}</th>)}</tr></thead>
                                    <tbody>{el.rows.slice(1).map((row, ri) => <tr key={ri}>{row.map((c, ci) => <td key={ci}>{renderInline(c)}</td>)}</tr>)}</tbody>
                                </table>
                            </div>
                        );
                    case 'h3': return <h3 key={el.key}>{renderInline(el.content)}</h3>;
                    case 'h4': return <h4 key={el.key}>{renderInline(el.content)}</h4>;
                    case 'quote': return <blockquote key={el.key}>{renderInline(el.content)}</blockquote>;
                    case 'li': buf.push(el); return null;
                    case 'br': { const l = flush(); return l || <br key={el.key} />; }
                    case 'p': { const l = flush(); return l ? <>{l}<p key={el.key} style={{ margin: '4px 0' }}>{renderInline(el.content)}</p></> : <p key={el.key} style={{ margin: '4px 0' }}>{renderInline(el.content)}</p>; }
                    default: return null;
                }
            })}
            {flush()}
        </>
    );
};

// ===================== COMPONENT =====================
export default function AdminChatPage() {
    const [chat, setChat] = useState([]);
    const [input, setInput] = useState('');
    const [typing, setTyping] = useState(false);

    const bottomRef = useRef(null);
    const taRef = useRef(null);
    const userInfo = useSelector(state => state.authAdminReducer.loggedUser);

    useEffect(() => {
        if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }, [chat.messages, typing]);

    useEffect(() => {
        if (taRef.current) {
            taRef.current.style.height = 'auto';
            taRef.current.style.height = Math.min(taRef.current.scrollHeight, 140) + 'px';
        }
    }, [input]);

    const send = useCallback(async (text = input.trim()) => {
        if (!text || typing) return;

        const um = { id: Date.now().toString(), role: 'user', content: text, time: new Date() };
        setChat(prev => [...prev, um] );
        setInput('');
        setTyping(true);

        try {
            const rs = await sendChatAiMessage(text);
            const aiResponse = rs.data?.data?.message || rs.data?.message || '';
            const experts = rs.data?.data?.experts || [];

            if (experts.length > 0) {
                const am = {
                    id: (Date.now() + 1).toString(),
                    role: 'assistant',
                    content: `Tìm thấy **${experts.length} chuyên gia** trong hệ thống:`,
                    experts,
                    time: new Date()
                };
                setChat(prev => [...prev, am]);
            }

            if (aiResponse) {
                const am = { id: (Date.now() + 2).toString(), role: 'assistant', content: aiResponse, time: new Date() };
                setChat(prev => [...prev, am]);
            }
        } catch (error) {
            const errorMsg = error.response?.data?.message
                || error.response?.data?.detail
                || error.message
                || 'Đã xảy ra lỗi khi kết nối tới AI. Vui lòng thử lại.';
            const am = { id: (Date.now() + 1).toString(), role: 'assistant', content: errorMsg, time: new Date() };
            setChat(prev => [...prev, am]);
        } finally {
            setTyping(false);
        }
    }, [input, typing]);

    const clearChat = () => {
        setChat([]);
    };

    const lastName = userInfo?.name?.split(' ').pop() || 'Admin';
    // const charCount = input.length;

    return (
        <div className="aichat-page">
            {/* ===== TOP BAR ===== */}
            <div className="aichat-topbar">
                <div className="aichat-topbar-left">
                    <div className="aichat-avatar-wrap">
                        <i className="bi bi-robot" />
                    </div>
                    <div className="aichat-topbar-info">
                        <h3>MajorGuide AI</h3>
                        <p>
                            <span className="aichat-mini-dot" />
                            Trực tuyến · Sẵn sàng hỗ trợ
                        </p>
                    </div>
                </div>
                <div className="aichat-topbar-actions">
                    <button className="aichat-icon-btn" onClick={clearChat} title="Xóa cuộc trò chuyện">
                        <i className="bi bi-arrow-counterclockwise" />
                    </button>
                    <button className="aichat-icon-btn" title="Export">
                        <i className="bi bi-download" />
                    </button>
                    <button className="aichat-icon-btn" title="Cài đặt">
                        <i className="bi bi-gear" />
                    </button>
                </div>
            </div>

            {/* ===== MESSAGES ===== */}
            <div className="aichat-messages">
                {chat.length === 0 ? (
                    /* ===== WELCOME ===== */
                    <div className="aichat-welcome">
                        <div className="aichat-welcome-icon">
                            <i className="bi bi-lightning-charge-fill" />
                        </div>
                        <h2>Chào mừng, {lastName}!</h2>
                        <p>Tôi là AI Assistant của MajorGuide. Hỏi tôi về bất cứ điều gì liên quan đến việc quản lý hệ thống.</p>

                        <div className="aichat-prompts">
                            {PROMPTS.map(p => (
                                <button key={p.id} className="aichat-prompt-card" onClick={() => send(p.title)}>
                                    <div className={`aichat-prompt-icon ${p.iconClass}`}>
                                        <i className={p.icon} />
                                    </div>
                                    <div className="aichat-prompt-text">
                                        <strong>{p.title}</strong>
                                        <span>{p.desc}</span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="aichat-quick-btns">
                            <button className="aichat-quick-btn" onClick={() => send('Hướng dẫn quản lý blog')}>
                                <i className="bi bi-pencil-square" /> Viết bài blog
                            </button>
                            <button className="aichat-quick-btn" onClick={() => send('Thống kê doanh thu tháng')}>
                                <i className="bi bi-currency-dollar" /> Doanh thu
                            </button>
                            <button className="aichat-quick-btn" onClick={() => send('Cách thêm chuyên gia mới')}>
                                <i className="bi bi-person-plus" /> Thêm chuyên gia
                            </button>
                            <button className="aichat-quick-btn" onClick={() => send('Quy trình xử lý đơn đặt lịch')}>
                                <i className="bi bi-calendar-event" /> Xử lý đơn lịch
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        {chat.map(msg => (
                            <div key={msg.id} className={`aichat-msg ${msg.role === 'user' ? 'is-user' : ''}`}>
                                <div className={`aichat-msg-avatar ${msg.role === 'user' ? 'is-user' : 'is-ai'}`}>
                                    {msg.role === 'user' ? (
                                        userInfo?.fileAvartarUrl
                                            ? <img src={userInfo.fileAvartarUrl} alt="Avatar" />
                                            : <i className="bi bi-person-fill" />
                                    ) : (
                                        <i className="bi bi-robot" />
                                    )}
                                </div>
                                <div className="aichat-msg-body">
                                    <div className="aichat-bubble">
                                        {msg.experts && msg.experts.length > 0 ? (
                                            <div className="aichat-expert-list">
                                                <div className="aichat-expert-list-header">
                                                    <i className="bi bi-people-fill" />
                                                    <span>{msg.content}</span>
                                                </div>
                                                <div className="aichat-expert-list-grid">
                                                    {msg.experts.map(e => <ExpertCardAdmin key={e.id} expert={e} />)}
                                                </div>
                                            </div>
                                        ) : (
                                            renderContent(msg.content)
                                        )}
                                    </div>
                                    <div className="aichat-msg-time">
                                        <i className="bi bi-clock" /> {fmtTime(msg.time)}
                                    </div>
                                </div>
                            </div>
                        ))}

                        {typing && (
                            <div className="aichat-typing">
                                <div className="aichat-msg-avatar is-ai">
                                    <i className="bi bi-robot" />
                                </div>
                                <div className="aichat-bubble">
                                    <span className="aichat-typing-dot" />
                                    <span className="aichat-typing-dot" />
                                    <span className="aichat-typing-dot" />
                                </div>
                            </div>
                        )}
                        <div ref={bottomRef} />
                    </>
                )}
            </div>

            {/* ===== TOKEN BAR ===== */}


            {/* ===== INPUT ===== */}
            <div className="aichat-input-section">
                <div className="aichat-input-wrap">
                    <textarea
                        ref={taRef}
                        className="aichat-textarea"
                        placeholder="Nhập câu hỏi của bạn..."
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), send())}
                        rows={1}
                        disabled={typing}
                    />
                    <div className="aichat-input-tools">
                        <button className="aichat-tool-btn" title="Đính kèm file">
                            <i className="bi bi-paperclip" />
                        </button>
                        <button className="aichat-tool-btn" title="Gửi ảnh">
                            <i className="bi bi-image" />
                        </button>
                    </div>
                    <button
                        className={`aichat-send-btn ${input.trim() ? 'can-send' : ''}`}
                        onClick={() => send()}
                        disabled={!input.trim() || typing}
                    >
                        <i className="bi bi-arrow-up" />
                    </button>
                </div>
                <div className="aichat-input-footer">
                    <span className="aichat-hint">
                        <kbd>Enter</kbd> gửi · <kbd>Shift</kbd>+<kbd>Enter</kbd> dòng mới
                    </span>
                </div>
            </div>
        </div>
    );
}
