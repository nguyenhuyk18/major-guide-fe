import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getVideoCallAccess } from '../../services/booking.api';
import '../../assets/css/VideoCallPage.css';

export default function VideoCallPage({ mode = 'member' }) {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const clientAuth = useSelector(state => state.authClientReducer);
    const expertAuth = useSelector(state => state.authAdminReducer);
    const auth = mode === 'expert' ? expertAuth : clientAuth;
    const [access, setAccess] = useState(null);
    const [checking, setChecking] = useState(true);
    const [error, setError] = useState('');
    const [started, setStarted] = useState(false);
    const [connection, setConnection] = useState('waiting');
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [peerMedia, setPeerMedia] = useState({ audio: true, video: true });
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const peerRef = useRef(null);
    const socketRef = useRef(null);
    const pendingIceRef = useRef([]);

    const getSocketToken = useCallback(() => {
        if (auth?.access_token) return auth.access_token;
        try {
            const storageKey = mode === 'expert' ? 'authAdminInfo' : 'authInfo';
            return JSON.parse(localStorage.getItem(storageKey) || '{}')?.access_token || '';
        } catch {
            return '';
        }
    }, [auth?.access_token, mode]);

    useEffect(() => {
        let active = true;
        getVideoCallAccess(bookingId)
            .then(response => { if (active) setAccess(response?.data?.data || null); })
            .catch(err => { if (active) setError(err?.response?.data?.message || 'Không thể kiểm tra quyền phòng gọi.'); })
            .finally(() => active && setChecking(false));
        return () => { active = false; };
    }, [bookingId]);

    const closeMedia = useCallback(() => {
        socketRef.current?.emit('video:leave');
        socketRef.current?.disconnect();
        socketRef.current = null;
        peerRef.current?.close();
        peerRef.current = null;
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
    }, []);

    useEffect(() => () => closeMedia(), [closeMedia]);

    const flushIce = async () => {
        if (!peerRef.current?.remoteDescription) return;
        const queued = pendingIceRef.current.splice(0);
        for (const candidate of queued) await peerRef.current.addIceCandidate(candidate);
    };

    const createOffer = async () => {
        if (!peerRef.current || peerRef.current.signalingState !== 'stable') return;
        const offer = await peerRef.current.createOffer();
        await peerRef.current.setLocalDescription(offer);
        socketRef.current?.emit('video:offer', { sdp: offer });
    };

    const startCall = async () => {
        if (!access?.canJoin || started) return;
        setError('');
        try {
            const token = getSocketToken();
            if (!bookingId?.trim()) throw new Error('INVALID_BOOKING');
            if (!token) throw new Error('MISSING_TOKEN');
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            localStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;

            const peer = new RTCPeerConnection({ iceServers: access.iceServers || [{ urls: 'stun:stun.l.google.com:19302' }] });
            peerRef.current = peer;
            stream.getTracks().forEach(track => peer.addTrack(track, stream));
            peer.ontrack = event => {
                if (remoteVideoRef.current) remoteVideoRef.current.srcObject = event.streams[0];
            };
            peer.onicecandidate = event => {
                if (event.candidate) socketRef.current?.emit('video:ice-candidate', { candidate: event.candidate });
            };
            peer.onconnectionstatechange = () => {
                const state = peer.connectionState;
                setConnection(state === 'connected' ? 'connected' : ['failed', 'disconnected', 'closed'].includes(state) ? 'disconnected' : 'connecting');
            };

            const socket = io(`${process.env.REACT_APP_API_URL}/video`, {
                path: '/socket.io', transports: ['websocket'], auth: { token }, reconnection: true,
            });
            socketRef.current = socket;
            socket.on('video:error', payload => setError(payload?.message || 'Kết nối phòng gọi thất bại.'));
            socket.on('connect_error', err => {
                setError(err?.message || 'Không thể kết nối đến máy chủ cuộc gọi.');
                setConnection('disconnected');
            });
            socket.on('video:peer-ready', async () => {
                setConnection('connecting');
                if (access.participantRole === 'member') await createOffer();
            });
            socket.on('video:offer', async ({ sdp }) => {
                if (access.participantRole !== 'expert') return;
                await peer.setRemoteDescription(sdp);
                await flushIce();
                const answer = await peer.createAnswer();
                await peer.setLocalDescription(answer);
                socket.emit('video:answer', { sdp: answer });
            });
            socket.on('video:answer', async ({ sdp }) => {
                if (access.participantRole !== 'member') return;
                await peer.setRemoteDescription(sdp);
                await flushIce();
            });
            socket.on('video:ice-candidate', async ({ candidate }) => {
                if (!candidate) return;
                if (peer.remoteDescription) await peer.addIceCandidate(candidate);
                else pendingIceRef.current.push(candidate);
            });
            socket.on('video:media-state', state => setPeerMedia(state));
            socket.on('video:peer-left', () => { setConnection('waiting'); if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null; });
            socket.on('connect', () => {
                socket.emit('video:join', { bookingId }, async result => {
                    if (!result?.ok) {
                        setError(result?.message || 'Không thể vào phòng gọi.');
                        closeMedia();
                        setStarted(false);
                        return;
                    }
                    setStarted(true);
                    setConnection(result.peerPresent ? 'connecting' : 'waiting');
                    if (result.peerPresent && result.role === 'member') await createOffer();
                });
            });
        } catch (err) {
            console.error('WebRTC start error:', err);
            setError(
                err?.message === 'MISSING_TOKEN' ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
                    : err?.message === 'INVALID_BOOKING' ? 'Mã phòng gọi không hợp lệ.'
                        : err?.name === 'NotAllowedError' ? 'Bạn cần cho phép truy cập camera và microphone để tham gia.'
                            : 'Không thể khởi động camera hoặc microphone.'
            );
            closeMedia();
        }
    };

    const toggleTrack = type => {
        const track = localStreamRef.current?.getTracks().find(item => item.kind === type);
        if (!track) return;
        track.enabled = !track.enabled;
        if (type === 'audio') setAudioEnabled(track.enabled); else setVideoEnabled(track.enabled);
        socketRef.current?.emit('video:media-state', {
            audio: type === 'audio' ? track.enabled : audioEnabled,
            video: type === 'video' ? track.enabled : videoEnabled,
        });
    };

    const leave = () => { closeMedia(); navigate(mode === 'expert' ? '/admin/expert-bookings' : '/my-bookings'); };
    const partnerName = access?.participantRole === 'member' ? access?.nameExpert : access?.nameCustomer;
    const connectionLabel = connection === 'connected' ? 'Đã kết nối'
        : connection === 'connecting' ? 'Đang kết nối'
            : connection === 'disconnected' ? 'Mất kết nối' : 'Đang chờ';

    if (checking) return <div className="video-call-state"><div className="spinner-border" /><p>Đang kiểm tra phòng gọi...</p></div>;
    if (!access?.canJoin) return <div className="video-call-state denied"><span><i className="bi bi-calendar-x" /></span><h1>Chưa thể tham gia</h1><p>{error || access?.reason || 'Phòng gọi hiện chưa khả dụng.'}</p><button onClick={leave}>Quay lại lịch đặt</button></div>;

    return (
        <div className={`video-call-page ${mode === 'expert' ? 'expert-mode' : ''}`}>
            <header className="video-call-header">
                <div className="video-call-brand">
                    <span className="video-call-brand-icon"><i className="bi bi-camera-video-fill" /></span>
                    <div>
                        <strong>MajorGuide Call</strong>
                        <small>Phòng #{bookingId.slice(0, 8).toUpperCase()}</small>
                    </div>
                </div>
                <div className="video-call-header-meta">
                    <span className="video-call-secure"><i className="bi bi-shield-check" /> Cuộc gọi được bảo mật</span>
                    <div className={`video-call-status ${connection}`}><i />{connectionLabel}</div>
                </div>
            </header>
            <main className="video-call-stage">
                <section className="video-remote-panel">
                    <video ref={remoteVideoRef} autoPlay playsInline />
                    {(!started || connection !== 'connected' || !peerMedia.video) && (
                        <div className="video-peer-placeholder">
                            <span className="video-peer-avatar"><i className={peerMedia.video ? 'bi bi-person-video3' : 'bi bi-camera-video-off'} /></span>
                            <span className="video-room-kicker">TƯ VẤN TRỰC TUYẾN 1:1</span>
                            <h1>{!started ? 'Sẵn sàng cho buổi tư vấn?' : partnerName || 'Người tham gia'}</h1>
                            <p>{!started ? 'Camera và microphone sẽ được kiểm tra khi bạn bắt đầu.' : connection === 'connected' && !peerMedia.video ? 'Đối phương đang tắt camera.' : `${partnerName || 'Đối phương'} chưa tham gia phòng.`}</p>
                            {!started && (
                                <div className="video-prejoin-actions">
                                    <button type="button" className="video-start-button" onClick={startCall}><i className="bi bi-camera-video-fill" /> Bắt đầu cuộc gọi</button>
                                    <button type="button" className="video-back-button" onClick={leave}><i className="bi bi-arrow-left" /> Quay lại</button>
                                </div>
                            )}
                            {started && connection !== 'connected' && <span className="video-waiting-hint"><i /> Giữ trang này mở trong khi chờ</span>}
                        </div>
                    )}
                    <div className="video-peer-label"><span className="video-label-dot" /><span>{partnerName || 'Đối phương'}</span>{!peerMedia.audio && <i className="bi bi-mic-mute-fill" />}</div>
                </section>
                <aside className="video-local-panel">
                    <video ref={localVideoRef} autoPlay muted playsInline className={!videoEnabled ? 'hidden-video' : ''} />
                    {(!started || !videoEnabled) && <div className="video-local-empty"><i className={`bi ${started ? 'bi-camera-video-off' : 'bi-person-fill'}`} /><span>{started ? 'Camera đã tắt' : 'Camera xem trước'}</span></div>}
                    <small><span /> Bạn {!audioEnabled && <i className="bi bi-mic-mute-fill" />}</small>
                </aside>
            </main>
            {error && <div className="video-call-error"><i className="bi bi-exclamation-triangle" />{error}<button onClick={() => setError('')}><i className="bi bi-x" /></button></div>}
            <footer className="video-call-controls">
                <button type="button" className={!audioEnabled ? 'off' : ''} disabled={!started} onClick={() => toggleTrack('audio')} title={audioEnabled ? 'Tắt microphone' : 'Bật microphone'}><span><i className={`bi ${audioEnabled ? 'bi-mic-fill' : 'bi-mic-mute-fill'}`} /></span><small>{audioEnabled ? 'Micro' : 'Đã tắt'}</small></button>
                <button type="button" className={!videoEnabled ? 'off' : ''} disabled={!started} onClick={() => toggleTrack('video')} title={videoEnabled ? 'Tắt camera' : 'Bật camera'}><span><i className={`bi ${videoEnabled ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'}`} /></span><small>{videoEnabled ? 'Camera' : 'Đã tắt'}</small></button>
                <button type="button" className="leave" onClick={leave}><span><i className="bi bi-telephone-x-fill" /></span><small>Kết thúc</small></button>
            </footer>
        </div>
    );
}
