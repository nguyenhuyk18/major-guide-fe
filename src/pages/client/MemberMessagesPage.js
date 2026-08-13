import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getUserById } from '../../services/expert.api';
import {
    createChatRoom,
    getMyChatRooms,
    getPrivateMessages,
    markPrivateRoomRead,
    sendPrivateMessage
} from '../../services/private-chat.api';
import '../../assets/css/MemberMessagesPage.css';

const getId = (value) => value?.id || value?._id;
const getRoomId = (room) => room?.id || room?._id;
const normalizeList = (response) => {
    const data = response?.data?.data;
    return Array.isArray(data) ? data : data?.result || [];
};

const formatMessageTime = (value) => {
    if (!value) return '';
    return new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
};

const formatRoomTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) return formatMessageTime(value);
    return date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
};

export default function MemberMessagesPage({ mode = 'member' }) {
    const clientAuth = useSelector(state => state.authClientReducer);
    const expertAuth = useSelector(state => state.authAdminReducer);
    const isExpertMode = mode === 'expert';
    const auth = isExpertMode ? expertAuth : clientAuth;
    const currentUser = auth.loggedUser;
    const currentUserId = getId(currentUser);
    const token = auth.access_token;
    const [searchParams, setSearchParams] = useSearchParams();
    const requestedExpertId = searchParams.get('expert_id');
    const requestedMemberId = searchParams.get('member_id');
    const [rooms, setRooms] = useState([]);
    const [experts, setExperts] = useState({});
    const [activeRoomId, setActiveRoomId] = useState('');
    const [messagesByRoom, setMessagesByRoom] = useState({});
    const [historyLoadedByRoom, setHistoryLoadedByRoom] = useState({});
    const [paginationByRoom, setPaginationByRoom] = useState({});
    const [loadingRooms, setLoadingRooms] = useState(true);
    const [loadingMessages, setLoadingMessages] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [sending, setSending] = useState(false);
    const [search, setSearch] = useState('');
    const [draft, setDraft] = useState('');
    const [showDetails, setShowDetails] = useState(false);
    const [socketConnected, setSocketConnected] = useState(false);
    const chatBodyRef = useRef(null);
    const socketRef = useRef(null);
    const activeRoomIdRef = useRef('');

    useEffect(() => {
        activeRoomIdRef.current = activeRoomId;
    }, [activeRoomId]);

    const upsertMessage = useCallback((roomId, message) => {
        if (!roomId || !message) return;
        const messageId = getId(message);
        setMessagesByRoom(current => {
            const existing = current[roomId] || [];
            if (messageId && existing.some(item => getId(item) === messageId)) return current;
            return { ...current, [roomId]: [...existing, message] };
        });
        setRooms(current => current.map(room => getRoomId(room) === roomId ? {
            ...room,
            last_message: {
                id: messageId,
                content: message.content,
                sendBy: message.sendBy,
                createdAt: message.createdAt
            },
            updatedAt: message.createdAt,
            unreadCount: message.sendBy !== currentUserId && activeRoomIdRef.current !== roomId
                ? Number(room.unreadCount || 0) + 1
                : room.unreadCount
        } : room).sort((a, b) => new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)));
    }, [currentUserId]);

    const loadExpertProfiles = useCallback(async (roomList) => {
        const ids = [...new Set(roomList.map(room => isExpertMode ? room.id_member : room.id_expert).filter(Boolean))];
        const entries = await Promise.all(ids.map(async id => {
            try {
                const response = await getUserById(id);
                return [id, response?.data?.data || null];
            } catch (error) {
                console.error(`Không thể tải chuyên gia ${id}:`, error);
                return [id, null];
            }
        }));
        setExperts(current => ({ ...current, ...Object.fromEntries(entries) }));
    }, [isExpertMode]);

    const loadRooms = useCallback(async () => {
        if (!token) return;
        setLoadingRooms(true);
        try {
            let roomList = normalizeList(await getMyChatRooms());

            if (!isExpertMode && requestedExpertId) {
                const existing = roomList.find(room => room.id_expert === requestedExpertId);
                if (!existing) {
                    const created = (await createChatRoom(requestedExpertId))?.data?.data;
                    if (created) roomList = [created, ...roomList];
                }
            }

            roomList = roomList.sort((a, b) => new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0));
            setRooms(roomList);
            await loadExpertProfiles(roomList);

            const requestedRoom = isExpertMode
                ? requestedMemberId && roomList.find(room => room.id_member === requestedMemberId)
                : requestedExpertId && roomList.find(room => room.id_expert === requestedExpertId);
            const nextRoomId = getRoomId(requestedRoom || roomList[0]);
            if (nextRoomId) setActiveRoomId(current => current || nextRoomId);
        } catch (error) {
            console.error('Không thể tải phòng chat:', error);
            toast.error(error?.response?.data?.message || 'Không thể tải danh sách tin nhắn.');
        } finally {
            setLoadingRooms(false);
        }
    }, [isExpertMode, loadExpertProfiles, requestedExpertId, requestedMemberId, token]);

    useEffect(() => {
        loadRooms();
    }, [loadRooms]);

    useEffect(() => {
        if (!token) return undefined;
        const socket = io(`${process.env.REACT_APP_API_URL}/private`, {
            path: '/socket.io',
            transports: ['websocket'],
            reconnection: true,
            auth: { token }
        });
        socketRef.current = socket;
        socket.on('connect', () => setSocketConnected(true));
        socket.on('disconnect', () => setSocketConnected(false));
        socket.on('connect_error', error => {
            setSocketConnected(false);
            console.error('[PrivateChat] Socket error:', error.message);
        });
        socket.on('private:error', payload => toast.error(payload?.message || 'Kết nối chat không hợp lệ.'));
        socket.on('private_message:new', payload => upsertMessage(payload?.roomId, payload?.message));
        socket.on('private_room:read', payload => {
            if (!payload?.roomId) return;
            setRooms(current => current.map(room => getRoomId(room) === payload.roomId
                ? { ...room, lastReadBy: payload.readerId, lastReadAt: payload.readAt }
                : room));
        });
        return () => {
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token, upsertMessage]);

    const loadMessages = useCallback(async (roomId, page = 1, appendOlder = false) => {
        if (!roomId) return;
        appendOlder ? setLoadingOlder(true) : setLoadingMessages(true);
        try {
            const response = await getPrivateMessages(roomId, page, 30);
            const data = response?.data?.data || {};
            const ordered = [...(data.result || [])].reverse();
            setMessagesByRoom(current => ({
                ...current,
                [roomId]: appendOlder ? [...ordered, ...(current[roomId] || [])] : ordered
            }));
            setPaginationByRoom(current => ({ ...current, [roomId]: { page: data.page || page, totalPage: data.totalPage || 1 } }));
            setHistoryLoadedByRoom(current => ({ ...current, [roomId]: true }));
        } catch (error) {
            console.error('Không thể tải lịch sử chat:', error);
            toast.error(error?.response?.data?.message || 'Không thể tải lịch sử trò chuyện.');
        } finally {
            setLoadingMessages(false);
            setLoadingOlder(false);
        }
    }, []);

    useEffect(() => {
        if (!activeRoomId) return;
        if (!historyLoadedByRoom[activeRoomId]) loadMessages(activeRoomId);
        markPrivateRoomRead(activeRoomId).catch(error => console.error('Không thể đánh dấu đã đọc:', error));
        setRooms(current => current.map(room => getRoomId(room) === activeRoomId ? { ...room, unreadCount: 0 } : room));
    }, [activeRoomId, historyLoadedByRoom, loadMessages]);

    useEffect(() => {
        if (!loadingMessages && chatBodyRef.current) chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }, [activeRoomId, loadingMessages, messagesByRoom]);

    const activeRoom = rooms.find(room => getRoomId(room) === activeRoomId);
    const activeParticipantId = activeRoom ? (isExpertMode ? activeRoom.id_member : activeRoom.id_expert) : '';
    const activeExpert = activeRoom ? experts[activeParticipantId] : null;
    const activeMessages = messagesByRoom[activeRoomId] || [];
    const activePagination = paginationByRoom[activeRoomId] || { page: 1, totalPage: 1 };

    const filteredRooms = useMemo(() => {
        const term = search.trim().toLowerCase();
        return rooms.filter(room => {
            const expert = experts[isExpertMode ? room.id_member : room.id_expert];
            return !term || expert?.name?.toLowerCase().includes(term) || expert?.email?.toLowerCase().includes(term) || expert?.expertProfile?.major?.toLowerCase().includes(term);
        });
    }, [experts, isExpertMode, rooms, search]);

    const selectRoom = (room) => {
        setActiveRoomId(getRoomId(room));
        if (!isExpertMode) setSearchParams({ expert_id: room.id_expert });
        setShowDetails(false);
    };

    const sendMessage = async (event) => {
        event.preventDefault();
        const content = draft.trim();
        if (!content || !activeRoomId || sending) return;
        setSending(true);
        try {
            const saved = (await sendPrivateMessage(activeRoomId, content))?.data?.data;
            if (saved) upsertMessage(activeRoomId, saved);
            setDraft('');
        } catch (error) {
            toast.error(error?.response?.data?.message || 'Không thể gửi tin nhắn.');
        } finally {
            setSending(false);
        }
    };

    const getAvatar = (expert) => expert?.fileAvartarUrl
        || `https://ui-avatars.com/api/?name=${encodeURIComponent(expert?.name || 'E')}&background=3157d5&color=fff`;

    if (!auth.isLogin || !token) {
        return (
            <div className="member-messages-auth-state">
                <span><i className="bi bi-chat-lock"></i></span>
                <h1>Đăng nhập để nhắn tin</h1>
                <p>Bạn cần đăng nhập trước khi sử dụng chức năng trò chuyện.</p>
                <Link to={isExpertMode ? '/admin/login' : '/'}>Quay lại đăng nhập</Link>
            </div>
        );
    }

    if (!isExpertMode && currentUser?.role_name !== 'member') {
        return <Navigate to="/admin/messages" replace />;
    }

    if (isExpertMode && !['expert', 'admin'].includes(currentUser?.role_name)) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className={`member-messages-page ${isExpertMode ? 'expert-messages-page' : ''}`}>
            <div className="container member-messages-container">
                <div className="member-messages-heading">
                    <div><span><i className="bi bi-chat-heart"></i> Trung tâm tin nhắn</span><h1>{isExpertMode ? 'Trò chuyện với học viên' : 'Trò chuyện với chuyên gia'}</h1><p>{isExpertMode ? 'Theo dõi và phản hồi các yêu cầu tư vấn từ học viên.' : 'Trao đổi trực tiếp để nhận định hướng phù hợp với bạn.'}</p></div>
                    {!isExpertMode && <Link to="/experts"><i className="bi bi-person-plus"></i> Tìm chuyên gia</Link>}
                </div>

                <div className={`member-inbox ${activeRoomId ? 'has-active-chat' : ''}`}>
                    <aside className="member-conversation-sidebar">
                        <div className="member-conversation-header"><div><strong>Tin nhắn</strong><span>{rooms.length} cuộc trò chuyện</span></div><span className={`member-socket-status ${socketConnected ? 'online' : ''}`} title={socketConnected ? 'Realtime đã kết nối' : 'Đang kết nối'}><i></i></span></div>
                        <div className="member-conversation-search"><i className="bi bi-search"></i><input value={search} onChange={event => setSearch(event.target.value)} placeholder="Tìm cuộc trò chuyện..." />{search && <button type="button" onClick={() => setSearch('')}><i className="bi bi-x"></i></button>}</div>
                        <div className="member-conversation-list">
                            {loadingRooms ? <div className="member-conversation-loading"><div className="spinner-border spinner-border-sm"></div> Đang tải...</div>
                                : filteredRooms.length === 0 ? <div className="member-conversation-empty"><i className="bi bi-chat-square-text"></i><span>Chưa có cuộc trò chuyện</span>{!isExpertMode && <Link to="/experts">Tìm chuyên gia</Link>}</div>
                                    : filteredRooms.map(room => {
                                        const participantId = isExpertMode ? room.id_member : room.id_expert;
                                        const expert = experts[participantId];
                                        const last = room.last_message;
                                        return <button type="button" key={getRoomId(room)} className={`member-conversation-item ${activeRoomId === getRoomId(room) ? 'active' : ''}`} onClick={() => selectRoom(room)}>
                                            <span className="member-message-avatar"><img src={getAvatar(expert)} alt={expert?.name || (isExpertMode ? 'Học viên' : 'Chuyên gia')} /><i></i></span>
                                            <span className="member-conversation-preview"><span><strong>{expert?.name || (isExpertMode ? 'Học viên' : 'Chuyên gia')}</strong><small>{formatRoomTime(last?.createdAt || room.updatedAt)}</small></span><span><small>{last?.content || room.name_room || 'Bắt đầu cuộc trò chuyện'}</small>{Number(room.unreadCount) > 0 && <b>{room.unreadCount}</b>}</span></span>
                                        </button>;
                                    })}
                        </div>
                    </aside>

                    <section className="member-chat-panel">
                        {activeRoom ? <>
                            <header className="member-chat-header">
                                <button className="member-chat-back" type="button" onClick={() => setActiveRoomId('')}><i className="bi bi-arrow-left"></i></button>
                                <span className="member-message-avatar"><img src={getAvatar(activeExpert)} alt={activeExpert?.name || ''} /><i></i></span>
                                <div><strong>{activeExpert?.name || (isExpertMode ? 'Học viên' : 'Chuyên gia')}</strong><span className={socketConnected ? '' : 'offline'}><i></i>{socketConnected ? 'Đang hoạt động' : 'Đang kết nối...'}</span></div>
                                <nav>{!isExpertMode && <Link to={`/choose-schedule?expert_id=${activeRoom.id_expert}`} title="Đặt lịch"><i className="bi bi-calendar2-check"></i></Link>}<button type="button" title="Thông tin người tham gia" onClick={() => setShowDetails(value => !value)}><i className="bi bi-info-circle"></i></button></nav>
                            </header>

                            <div className="member-chat-body" ref={chatBodyRef}>
                                {activePagination.page < activePagination.totalPage && <button className="member-load-older" type="button" disabled={loadingOlder} onClick={() => loadMessages(activeRoomId, activePagination.page + 1, true)}>{loadingOlder ? 'Đang tải...' : 'Tải tin nhắn cũ hơn'}</button>}
                                <div className="member-chat-welcome"><img src={getAvatar(activeExpert)} alt="" /><strong>{activeExpert?.name || (isExpertMode ? 'Học viên' : 'Chuyên gia')}</strong><p>{isExpertMode ? (activeExpert?.email || 'Thành viên MajorGuide') : (activeExpert?.expertProfile?.major || 'Chuyên gia tư vấn hướng nghiệp')}</p>{isExpertMode ? <Link to={`/admin/members/${activeRoom.id_member}`}>Xem hồ sơ học viên</Link> : <Link to={`/experts/${activeRoom.id_expert}`}>Xem hồ sơ chuyên gia</Link>}</div>
                                {loadingMessages ? <div className="member-chat-loading"><div className="spinner-border spinner-border-sm"></div> Đang tải tin nhắn...</div>
                                    : activeMessages.length === 0 ? <div className="member-chat-empty">Hãy gửi lời chào để bắt đầu cuộc trò chuyện.</div>
                                        : activeMessages.map(message => {
                                            const mine = message.sendBy === currentUserId;
                                            return <div key={getId(message)} className={`member-message-row ${mine ? 'mine' : ''}`}>{!mine && <img src={getAvatar(activeExpert)} alt="" />}<div><p>{message.content}</p><span>{formatMessageTime(message.createdAt)}{mine && <i className="bi bi-check2-all"></i>}</span></div></div>;
                                        })}
                            </div>

                            <form className="member-chat-composer" onSubmit={sendMessage}><button type="button" disabled title="Đính kèm file sẽ được bổ sung sau"><i className="bi bi-paperclip"></i></button><div><textarea rows="1" maxLength="2000" value={draft} onChange={event => setDraft(event.target.value)} onKeyDown={event => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendMessage(event); } }} placeholder="Nhập tin nhắn..." /><span className="member-draft-count">{draft.length}/2000</span></div><button type="submit" disabled={!draft.trim() || sending}><i className={sending ? 'spinner-border spinner-border-sm' : 'bi bi-send-fill'}></i></button></form>

                            {showDetails && <aside className="member-chat-details"><button type="button" onClick={() => setShowDetails(false)}><i className="bi bi-x-lg"></i></button><img src={getAvatar(activeExpert)} alt={activeExpert?.name || ''} /><h3>{activeExpert?.name || (isExpertMode ? 'Học viên' : 'Chuyên gia')}</h3><p>{isExpertMode ? (activeExpert?.email || 'Thành viên MajorGuide') : (activeExpert?.expertProfile?.major || 'Chuyên gia tư vấn')}</p>{isExpertMode ? <><div><span><i className="bi bi-envelope"></i></span><p><small>Email học viên</small><strong>{activeExpert?.email || 'Đang cập nhật'}</strong></p></div><Link to={`/admin/members/${activeRoom.id_member}`}>Xem hồ sơ đầy đủ</Link></> : <><div><span><i className="bi bi-building"></i></span><p><small>Nơi công tác</small><strong>{activeExpert?.expertProfile?.teachAt || 'Đang cập nhật'}</strong></p></div><div><span><i className="bi bi-cash-coin"></i></span><p><small>Phí tư vấn</small><strong>{activeExpert?.expertProfile?.price ? `${new Intl.NumberFormat('vi-VN').format(activeExpert.expertProfile.price)}đ` : 'Liên hệ'}</strong></p></div><Link to={`/experts/${activeRoom.id_expert}`}>Xem hồ sơ đầy đủ</Link></>}</aside>}
                        </> : <div className="member-chat-placeholder"><span><i className="bi bi-chat-dots"></i></span><h2>Tin nhắn của bạn</h2><p>{isExpertMode ? 'Chọn một học viên để xem và trả lời cuộc trò chuyện.' : 'Chọn một cuộc trò chuyện hoặc tìm chuyên gia để bắt đầu.'}</p>{!isExpertMode && <Link to="/experts">Khám phá chuyên gia</Link>}</div>}
                    </section>
                </div>
            </div>
        </div>
    );
}
