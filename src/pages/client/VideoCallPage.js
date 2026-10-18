import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getVideoCallAccess } from '../../services/booking.api';
import '../../assets/css/VideoCallPage.css';

const initials = name => (name || '?').trim().split(/\s+/).slice(-2).map(part => part[0]).join('').toUpperCase();
const formatClock = value => value ? new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : '';
const formatElapsed = seconds => {
    const h = Math.floor(seconds / 3600);
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    return h ? `${h}:${m}:${s}` : `${m}:${s}`;
};

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
    const [starting, setStarting] = useState(false);
    const startingRef = useRef(false);
    const [connection, setConnection] = useState('waiting');
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [videoEnabled, setVideoEnabled] = useState(true);
    const [previewState, setPreviewState] = useState('idle');
    const [sharing, setSharing] = useState(false);
    const [fullscreen, setFullscreen] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [peerMedia, setPeerMedia] = useState({ audio: true, video: true });
    const pageRef = useRef(null);
    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);
    const localStreamRef = useRef(null);
    const screenTrackRef = useRef(null);
    const peerRef = useRef(null);
    const socketRef = useRef(null);
    const pendingIceRef = useRef([]);
    const mediaStateRef = useRef({ audio: true, video: true });

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

    const attachLocal = useCallback(stream => {
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    }, []);

    const stopScreenTrack = () => {
        screenTrackRef.current?.stop();
        screenTrackRef.current = null;
        setSharing(false);
    };

    const closeMedia = useCallback(() => {
        socketRef.current?.emit('video:leave');
        socketRef.current?.disconnect();
        socketRef.current = null;
        peerRef.current?.close();
        peerRef.current = null;
        screenTrackRef.current?.stop();
        screenTrackRef.current = null;
        localStreamRef.current?.getTracks().forEach(track => track.stop());
        localStreamRef.current = null;
        pendingIceRef.current = [];
        startingRef.current = false;
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    }, []);

    const mountedRef = useRef(true);
    useEffect(() => {
        mountedRef.current = true;
        return () => { mountedRef.current = false; closeMedia(); };
    }, [closeMedia]);

    // Camera preview in the lobby; the same stream is reused when the call starts.
    const startPreview = useCallback(async () => {
        if (localStreamRef.current || !navigator.mediaDevices?.getUserMedia) return;
        setPreviewState('loading');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            if (!mountedRef.current || localStreamRef.current) { stream.getTracks().forEach(track => track.stop()); return; }
            stream.getAudioTracks().forEach(track => { track.enabled = mediaStateRef.current.audio; });
            stream.getVideoTracks().forEach(track => { track.enabled = mediaStateRef.current.video; });
            localStreamRef.current = stream;
            attachLocal(stream);
            setPreviewState('ready');
        } catch (err) {
            if (mountedRef.current) setPreviewState(err?.name === 'NotAllowedError' ? 'denied' : 'unavailable');
        }
    }, [attachLocal]);

    useEffect(() => {
        if (access?.canJoin && !started && previewState === 'idle') startPreview();
    }, [access?.canJoin, started, previewState, startPreview]);

    // Re-attach the local stream whenever the <video> element is remounted (lobby -> room).
    useEffect(() => { if (localStreamRef.current) attachLocal(localStreamRef.current); }, [started, attachLocal]);

    useEffect(() => {
        if (connection !== 'connected') return;
        const startedAt = Date.now() - elapsed * 1000;
        const timer = setInterval(() => setElapsed(Math.floor((Date.now() - startedAt) / 1000)), 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [connection]);

    useEffect(() => {
        const onChange = () => setFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener('fullscreenchange', onChange);
        return () => document.removeEventListener('fullscreenchange', onChange);
    }, []);

    const emitMediaState = () => socketRef.current?.emit('video:media-state', mediaStateRef.current);

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
        if (!access?.canJoin || started || startingRef.current) return;
        startingRef.current = true;
        setStarting(true);
        setPeerMedia({ audio: true, video: true });
        setError('');
        try {
            const token = getSocketToken();
            if (!bookingId?.trim()) throw new Error('INVALID_BOOKING');
            if (!token) throw new Error('MISSING_TOKEN');
            let stream = localStreamRef.current;
            if (!stream || stream.getTracks().every(track => track.readyState === 'ended')) {
                stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                localStreamRef.current = stream;
                attachLocal(stream);
                setPreviewState('ready');
            }
            // Keep the choices made in the lobby.
            stream.getAudioTracks().forEach(track => { track.enabled = audioEnabled; });
            stream.getVideoTracks().forEach(track => { track.enabled = videoEnabled; });
            mediaStateRef.current = { audio: audioEnabled, video: videoEnabled };

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
                closeMedia(); setStarting(false); setStarted(false);
                setPreviewState('idle');
                setError(err?.message || 'Không thể kết nối đến máy chủ cuộc gọi.');
                setConnection('disconnected');
            });
            socket.on('video:peer-ready', async () => {
                setConnection('connecting');
                emitMediaState();
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
                    setStarting(false); startingRef.current = false;
                    if (!result?.ok) {
                        setError(result?.message || 'Không thể vào phòng gọi.');
                        closeMedia();
                        setStarted(false);
                        setPreviewState('idle');
                        return;
                    }
                    setStarted(true);
                    setConnection(result.peerPresent ? 'connecting' : 'waiting');
                    emitMediaState();
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
            setPreviewState('idle');
            setStarting(false); setStarted(false);
        }
    };

    const toggleTrack = type => {
        const track = localStreamRef.current?.getTracks().find(item => item.kind === type);
        if (!track) return;
        track.enabled = !track.enabled;
        if (type === 'audio') setAudioEnabled(track.enabled); else setVideoEnabled(track.enabled);
        mediaStateRef.current = { ...mediaStateRef.current, [type]: track.enabled || (type === 'video' && sharing) };
        emitMediaState();
    };

    const videoSender = () => peerRef.current?.getSenders().find(sender => sender.track?.kind === 'video');

    const stopSharing = async () => {
        const cameraTrack = localStreamRef.current?.getVideoTracks()[0];
        stopScreenTrack();
        if (cameraTrack) await videoSender()?.replaceTrack(cameraTrack);
        attachLocal(localStreamRef.current);
        mediaStateRef.current = { ...mediaStateRef.current, video: Boolean(cameraTrack?.enabled) };
        emitMediaState();
    };

    const toggleShare = async () => {
        if (sharing) return stopSharing();
        try {
            const display = await navigator.mediaDevices.getDisplayMedia({ video: true });
            const screenTrack = display.getVideoTracks()[0];
            screenTrackRef.current = screenTrack;
            await videoSender()?.replaceTrack(screenTrack);
            screenTrack.onended = () => { if (screenTrackRef.current === screenTrack) stopSharing(); };
            if (localVideoRef.current) localVideoRef.current.srcObject = display;
            setSharing(true);
            mediaStateRef.current = { ...mediaStateRef.current, video: true };
            emitMediaState();
        } catch (err) {
            if (err?.name !== 'NotAllowedError') setError('Không thể chia sẻ màn hình trên trình duyệt này.');
        }
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement) document.exitFullscreen?.();
        else pageRef.current?.requestFullscreen?.();
    };

    const leave = () => {
        if (document.fullscreenElement) document.exitFullscreen?.();
        closeMedia();
        navigate(mode === 'expert' ? '/admin/expert-bookings' : '/my-bookings');
    };

    const partnerName = access?.participantRole === 'member' ? access?.nameExpert : access?.nameCustomer;
    const partnerRole = access?.participantRole === 'member' ? 'Chuyên gia tư vấn' : 'Học viên';
    const schedule = access?.timeStart ? `${formatClock(access.timeStart)} – ${formatClock(access.timeEnd)}` : '';
    const connectionLabel = connection === 'connected' ? 'Đã kết nối'
        : connection === 'connecting' ? 'Đang kết nối'
            : connection === 'disconnected' ? 'Mất kết nối' : 'Đang chờ';
    const showRemote = started && connection === 'connected' && peerMedia.video;
    const showLocalVideo = sharing || (videoEnabled && previewState === 'ready');

    if (checking) return <div className="vc-state"><div className="vc-spinner" /><p>Đang kiểm tra phòng gọi…</p></div>;
    if (!access?.canJoin) return (
        <div className="vc-state">
            <div className="vc-state-card">
                <span className="vc-state-icon"><i className="bi bi-calendar-x" /></span>
                <h1>Chưa thể tham gia</h1>
                <p>{error || access?.reason || 'Phòng gọi hiện chưa khả dụng.'}</p>
                <button type="button" className="vc-btn-primary" onClick={leave}><i className="bi bi-arrow-left" /> Quay lại lịch đặt</button>
            </div>
        </div>
    );

    const errorBanner = error && (
        <div className="vc-toast" role="alert">
            <i className="bi bi-exclamation-triangle-fill" /><span>{error}</span>
            <button type="button" aria-label="Đóng thông báo" onClick={() => setError('')}><i className="bi bi-x-lg" /></button>
        </div>
    );

    if (!started) return (
        <div ref={pageRef} className={`vc-page vc-lobby ${mode === 'expert' ? 'expert-mode' : ''}`}>
            <section className="vc-lobby-preview">
                <div className="vc-preview-frame">
                    <video ref={localVideoRef} autoPlay muted playsInline className={showLocalVideo ? 'mirrored' : 'hidden-video'} />
                    {!showLocalVideo && (
                        <div className="vc-preview-empty">
                            <span className="vc-avatar lg">{previewState === 'loading' ? <span className="vc-spinner sm" /> : <i className="bi bi-person-fill" />}</span>
                            <p>{previewState === 'loading' ? 'Đang bật camera…'
                                : previewState === 'denied' ? 'Trình duyệt đang chặn camera/micro. Hãy cấp quyền ở thanh địa chỉ.'
                                    : previewState === 'unavailable' ? 'Không tìm thấy camera hoặc micro.'
                                        : 'Camera đang tắt'}</p>
                        </div>
                    )}
                    <div className="vc-preview-tools">
                        <button type="button" className={`vc-round ${!audioEnabled ? 'off' : ''}`} disabled={previewState !== 'ready'} onClick={() => toggleTrack('audio')} title={audioEnabled ? 'Tắt micro' : 'Bật micro'}>
                            <i className={`bi ${audioEnabled ? 'bi-mic-fill' : 'bi-mic-mute-fill'}`} />
                        </button>
                        <button type="button" className={`vc-round ${!videoEnabled ? 'off' : ''}`} disabled={previewState !== 'ready'} onClick={() => toggleTrack('video')} title={videoEnabled ? 'Tắt camera' : 'Bật camera'}>
                            <i className={`bi ${videoEnabled ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'}`} />
                        </button>
                    </div>
                    <span className="vc-preview-tag">Xem trước</span>
                </div>
            </section>
            <section className="vc-lobby-card">
                <span className="vc-kicker"><i className="bi bi-shield-lock-fill" /> Phòng tư vấn riêng 1:1</span>
                <h1>Sẵn sàng tham gia?</h1>
                <div className="vc-partner">
                    <span className="vc-avatar">{initials(partnerName)}</span>
                    <div>
                        <strong>{partnerName || 'Người tham gia'}</strong>
                        <small>{partnerRole}</small>
                    </div>
                </div>
                <dl className="vc-meta">
                    <div><dt><i className="bi bi-calendar3" /> Ngày</dt><dd>{access.daySupport}</dd></div>
                    {schedule && <div><dt><i className="bi bi-clock" /> Thời gian</dt><dd>{schedule}</dd></div>}
                    <div><dt><i className="bi bi-hash" /> Mã phòng</dt><dd>{bookingId.slice(0, 8).toUpperCase()}</dd></div>
                </dl>
                <button type="button" className="vc-btn-primary lg" disabled={starting} onClick={startCall}>
                    {starting ? <><span className="vc-spinner sm" /> Đang kết nối…</> : <><i className="bi bi-camera-video-fill" /> Tham gia ngay</>}
                </button>
                <button type="button" className="vc-btn-ghost" onClick={leave}><i className="bi bi-arrow-left" /> Quay lại</button>
                <p className="vc-note"><i className="bi bi-info-circle" /> Kết nối ngang hàng (WebRTC), hình ảnh và âm thanh không được ghi lại.</p>
            </section>
            {errorBanner}
        </div>
    );

    return (
        <div ref={pageRef} data-connected={connection === 'connected'} className={`vc-page vc-room ${mode === 'expert' ? 'expert-mode' : ''}`}>
            <video ref={remoteVideoRef} autoPlay playsInline className={`vc-remote ${showRemote ? '' : 'hidden-video'}`} />
            {!showRemote && (
                <div className="vc-remote-empty">
                    <span className={`vc-avatar xl ${connection !== 'connected' ? 'pulse' : ''}`}>{initials(partnerName)}</span>
                    <h2>{partnerName || 'Người tham gia'}</h2>
                    <p>{connection === 'connected' ? 'Đối phương đang tắt camera'
                        : connection === 'connecting' ? 'Đang thiết lập kết nối…'
                            : connection === 'disconnected' ? 'Kết nối bị gián đoạn, đang thử lại…'
                                : `Đang chờ ${partnerName || 'đối phương'} tham gia`}</p>
                </div>
            )}

            <header className="vc-topbar">
                <div className="vc-topbar-left">
                    <span className="vc-brand"><i className="bi bi-camera-video-fill" /></span>
                    <div>
                        <strong>Tư vấn với {partnerName || 'đối phương'}</strong>
                        <small>{schedule || access.daySupport} · #{bookingId.slice(0, 8).toUpperCase()}</small>
                    </div>
                </div>
                <div className="vc-topbar-right">
                    {connection === 'connected' && <span className="vc-chip rec"><i /> {formatElapsed(elapsed)}</span>}
                    <span className={`vc-chip status ${connection}`}><i />{connectionLabel}</span>
                </div>
            </header>

            {connection === 'connected' && (
                <div className="vc-name-tag">
                    {!peerMedia.audio && <i className="bi bi-mic-mute-fill" />}
                    <span>{partnerName || 'Đối phương'}</span>
                </div>
            )}

            <aside className={`vc-self ${sharing ? 'sharing' : ''}`}>
                <video ref={localVideoRef} autoPlay muted playsInline className={`${showLocalVideo ? '' : 'hidden-video'} ${sharing ? '' : 'mirrored'}`} />
                {!showLocalVideo && <div className="vc-self-empty"><span className="vc-avatar sm">Bạn</span></div>}
                <small>{!audioEnabled && <i className="bi bi-mic-mute-fill" />} Bạn{sharing ? ' · đang chia sẻ màn hình' : ''}</small>
            </aside>

            {errorBanner}

            <footer className="vc-dock" role="toolbar" aria-label="Điều khiển cuộc gọi">
                <button type="button" className={`vc-round ${!audioEnabled ? 'off' : ''}`} onClick={() => toggleTrack('audio')} title={audioEnabled ? 'Tắt micro' : 'Bật micro'} aria-pressed={!audioEnabled}>
                    <i className={`bi ${audioEnabled ? 'bi-mic-fill' : 'bi-mic-mute-fill'}`} />
                </button>
                <button type="button" className={`vc-round ${!videoEnabled ? 'off' : ''}`} onClick={() => toggleTrack('video')} title={videoEnabled ? 'Tắt camera' : 'Bật camera'} aria-pressed={!videoEnabled}>
                    <i className={`bi ${videoEnabled ? 'bi-camera-video-fill' : 'bi-camera-video-off-fill'}`} />
                </button>
                {navigator.mediaDevices?.getDisplayMedia && (
                    <button type="button" className={`vc-round ${sharing ? 'active' : ''}`} onClick={toggleShare} title={sharing ? 'Dừng chia sẻ' : 'Chia sẻ màn hình'} aria-pressed={sharing}>
                        <i className={`bi ${sharing ? 'bi-display-fill' : 'bi-display'}`} />
                    </button>
                )}
                <button type="button" className="vc-round" onClick={toggleFullscreen} title={fullscreen ? 'Thoát toàn màn hình' : 'Toàn màn hình'}>
                    <i className={`bi ${fullscreen ? 'bi-fullscreen-exit' : 'bi-arrows-fullscreen'}`} />
                </button>
                <span className="vc-dock-divider" />
                <button type="button" className="vc-leave" onClick={leave} title="Rời cuộc gọi">
                    <i className="bi bi-telephone-x-fill" /><span>Kết thúc</span>
                </button>
            </footer>
        </div>
    );
}
