import { useEffect, useRef, useState } from 'react';
import FrameChatCurrent from './FrameChatCurrent';
import FrameChatOrder from './FrameChatOrther';
import { getMessage, getMessageById, sendMessage } from '../../services/chat.api';
import { getUserAccess, getUserByIds } from '../../services/user-access.api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { io } from "socket.io-client";
import { CHAT_COMNUNITY } from '../../constants/constant';
import '../../assets/css/ChatCommunity.css';

export default function ChatCommunity() {
    const userInfo = useSelector(state => state?.authClientReducer?.access_token);

    const userCalled = useRef(new Map());
    const frameContainerChat = useRef(null);
    const hasMoreMessage = useRef(true);
    const page = useRef(1);
    // const [listReply, setIsReply] = useState([]);
    const [replySomeOne, setIsReplySomeone] = useState(null);
    const [highlightedMessageId, setHighlightedMessageId] = useState(null);
    const idUser = useSelector(state => state?.authClientReducer?.loggedUser?.id);
    // console.log(idUser)

    const [messageList, setMessageList] = useState([]);
    const [isConnected, setIsConnected] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const socketRef = useRef(null);

    const appendMessageIfMissing = (message) => {
        if (!message?._id) return;
        setMessageList(currentMessages => {
            const alreadyExists = currentMessages.some(item => item._id === message._id);
            return alreadyExists ? currentMessages : [...currentMessages, message];
        });
    };

    const scrollToBottom = () => {
        if (frameContainerChat.current) {
            frameContainerChat.current.scrollTop = frameContainerChat.current.scrollHeight
        }
    }

    const isNearestBtn = (thresHold = 200) => {
        if (frameContainerChat.current) {
            return frameContainerChat.current.scrollHeight - frameContainerChat.current.scrollTop - frameContainerChat.current.clientHeight < thresHold;
        }
        return true;
    }

    useEffect(() => {
        getChatList();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!userInfo) {
            setIsConnected(false);
            return undefined;
        }

        const socket = io(process.env['REACT_APP_API_URL'],
            {
                path: '/socket.io',
                transports: ['websocket'],
                reconnection: true,
                reconnectionAttempts: Infinity,
                reconnectionDelay: 1000,
                auth: {
                    token: userInfo
                }
            }
        );
        socketRef.current = socket;

        socket.on('connect', () => setIsConnected(true));
        socket.on('disconnect', () => setIsConnected(false));
        socket.on('connect_error', (error) => {
            setIsConnected(false);
            console.error('[CommunityChat] Socket connection error:', error.message);
        });

        socket.on(CHAT_COMNUNITY[0], async (data) => {
            const { id, userId, replyTo, message } = data;

            if (!userCalled.current.get(userId)) {
                try {
                    const rs = await getUserAccess(userId);
                    userCalled.current.set(userId, rs.data.data);
                } catch (error) {
                    toast.error('Lỗi đã xảy ra !!!');
                }
            }
            appendMessageIfMissing({
                _id: id,
                sendBy: userId,
                content: message,
                replyTo: replyTo
            });


            requestAnimationFrame(() => {
                if (isNearestBtn()) {
                    scrollToBottom();
                }

            });

        })



        return () => {
            socket.off(CHAT_COMNUNITY[0]);
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
            socket.disconnect()
            if (socketRef.current === socket) socketRef.current = null;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userInfo])




    const getChatList = async () => {
        try {
            const listChat = await getMessage();
            hasMoreMessage.current = listChat.data.data.hasMore;

            let ids = []
            listChat.data.data.chatList.forEach(row => {

                ids.push(row.sendBy);
            });


            const users = await getUserByIds({
                ids: ids
            });

            const keys = Object.keys(users.data.data);

            keys.forEach(row => {
                userCalled.current.set(row, users.data.data[row]);
            })

            const messList = listChat.data.data.chatList.slice().reverse();
            setMessageList([...messList]);


            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    scrollToBottom();
                });
            });

        } catch (error) {
            console.log(error);
            toast.error('Server đang bị lỗi hãy thử lại sau !!!');
        } finally {
            setIsLoading(false);
        }
    }




    const formik = useFormik({
        // Khởi động giá trị cho thẻ nhập liệu
        initialValues: {
            content: '',
            replyTo: replySomeOne?._id || ''
        },
        // Kiểm tra dữ liệu hợp lệ không
        validationSchema: Yup.object({
            content: Yup.string()
                .trim()
                .required('Vui lòng nhập nội dung tin nhắn')
                .max(1000, 'Tin nhắn không được vượt quá 1000 ký tự'),
            // password: Yup.string().required('Vui lòng nhập mật khẩu của bạn !!')
        }),

        onSubmit: async (values, { resetForm }) => {
            try {
                // Include replyTo in the message if replying to someone
                const messageData = {
                    ...values,
                    replyTo: replySomeOne?._id || ''
                };

                const response = await sendMessage(messageData);
                const savedMessage = response?.data?.data;

                if (savedMessage?._id || savedMessage?.id) {
                    appendMessageIfMissing({
                        ...savedMessage,
                        _id: savedMessage._id || savedMessage.id,
                        sendBy: savedMessage.sendBy || idUser,
                        content: savedMessage.content || messageData.content,
                        replyTo: savedMessage.replyTo || messageData.replyTo
                    });
                }

                resetForm();
                setIsReplySomeone(null);
                // Reset replyTo field for next message
                formik.setFieldValue('replyTo', '');

                requestAnimationFrame(() => {
                    requestAnimationFrame(scrollToBottom);
                });
            } catch (error) {
                toast.error('Không thể gửi tin nhắn hãy đăng nhập và gửi lại sau !!!');
            }
        },
    });

    const handleOnScroll = async (e) => {
        const el = e.target;
        const oldHeight = el.scrollHeight;
        try {
            if (el.scrollTop === 0 && hasMoreMessage.current) {
                page.current += 1;
                const rs = await getMessage(page.current);
                const listMessage = rs.data.data.chatList.slice().reverse();
                hasMoreMessage.current = rs.data.data.hasMore;

                let ids = [];

                // lấy user bị thiếu
                rs.data.data.chatList.forEach(row => {
                    if (!userCalled.current.get(row.sendBy)) {
                        ids.push(row.sendBy);
                    }
                })

                // tìm users theo ids
                const users = await getUserByIds({
                    ids
                })

                const keys = Object.keys(users.data.data);

                keys.forEach(row => {
                    userCalled.current.set(row, users.data.data[row]);
                })

                setMessageList(prevMessage => [...listMessage, ...prevMessage]);
                // delay vẽ giao diện để tính toán lại heightscroll
                // requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    el.scrollTop += el.scrollHeight - oldHeight
                });
                // });
            }
        } catch (error) {
            toast.error('Lỗi đã xảy ra, hãy thử lại sau !!!');
        }
    }

    const handleOnAnwser = async (idMessage) => {
        const messageAnswer = messageList.find(row => row._id === idMessage);

        try {
            // console.log(idMessage)
            const rs = await getUserAccess(messageAnswer.sendBy);
            // console.log(rs);
            setIsReplySomeone({
                ...messageAnswer,
                name: rs.data.data.name
            })
        } catch (error) {
            console.log(error);
            toast.error('Lỗi đã xảy ra !!!');
        }
    }


    const handleOnCloseAnwser = () => {
        setIsReplySomeone(null);
    }

    const handleOnReplyClick = async (messageId) => {
        const existEl = document.getElementById(messageId);
        if (existEl) {
            setHighlightedMessageId(messageId);

            requestAnimationFrame(() => {
                existEl.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            });

            setTimeout(() => {
                setHighlightedMessageId(null);
            }, 2000);

            return;
        }

        while (hasMoreMessage.current) {
            page.current += 1;
            const rs = await getMessage(page.current);

            const listMessage = rs.data.data.chatList.slice().reverse();
            hasMoreMessage.current = rs.data.data.hasMore;

            let ids = [];
            let idMessage = [];

            rs.data.data.chatList.forEach(row => {
                idMessage.push(row._id);
                if (!userCalled.current.get(row.sendBy)) {
                    ids.push(row.sendBy);
                }
            });

            if (ids.length) {
                const users = await getUserByIds({ ids });
                Object.keys(users.data.data).forEach(key => {
                    userCalled.current.set(key, users.data.data[key]);
                });
            }

            setMessageList(prev => [...listMessage, ...prev]);

            if (idMessage.includes(messageId)) break;
        }

        setHighlightedMessageId(messageId);

        setTimeout(() => {
            const el = document.getElementById(messageId);
            if (el) {
                el.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                });
            }
        }, 50);
    }

    const getOriginalMessage = async (replyToId) => {
        // console.log(messageList.find(msg => msg._id === replyToId));
        const rs = messageList.find(msg => msg._id === replyToId);

        if (!rs) {
            const rs1 = await getMessageById(replyToId);
            const user = await getUserAccess(rs1.data.data.sendBy);
            // console.log(rs1);
            return {
                ...rs1.data.data,
                name: user.data.data.name
            };
        }

        const user = await getUserAccess(rs.sendBy);

        return {
            ...rs,
            name: user.data.data.name
        };
    }

    return (
        <section className="client-section client-forum-section community-chat">
            <div className="community-chat-glow community-chat-glow-one"></div>
            <div className="community-chat-glow community-chat-glow-two"></div>
            <div className="container community-chat-container">
                <div className="community-chat-intro">
                    <div>
                        <span className="community-chat-eyebrow"><i className="bi bi-stars"></i> Không gian kết nối</span>
                        <h2>Hỏi đáp cùng cộng đồng</h2>
                        <p>Chia sẻ băn khoăn, trao đổi kinh nghiệm và cùng nhau tìm ra hướng đi phù hợp.</p>
                    </div>
                    <div className="community-chat-intro-badge">
                        <span><i className="bi bi-shield-check"></i></span>
                        <div><strong>Cộng đồng tích cực</strong><small>Tôn trọng và hỗ trợ lẫn nhau</small></div>
                    </div>
                </div>

                <div className="community-chat-shell">
                    <header className="community-chat-header">
                        <div className="community-chat-room-icon">
                            <i className="bi bi-people-fill"></i>
                            <span></span>
                        </div>
                        <div className="community-chat-room-info">
                            <h3>Phòng thảo luận chung</h3>
                            <p><span className={isConnected ? 'online' : ''}></span>{isConnected ? 'Đang kết nối trực tuyến' : 'Đang kết nối lại...'}</p>
                        </div>
                        <div className="community-chat-live">
                            <i className="bi bi-broadcast"></i>
                            <span>LIVE</span>
                        </div>
                    </header>

                    <div
                        className="client-forum-messages community-chat-messages"
                        onScroll={handleOnScroll}
                        ref={frameContainerChat}
                    >
                        {hasMoreMessage.current && messageList.length > 0 && (
                            <div className="community-chat-history-hint">
                                <i className="bi bi-arrow-up"></i> Cuộn lên để xem tin nhắn cũ hơn
                            </div>
                        )}

                        {isLoading ? (
                            <div className="community-chat-state">
                                <span className="community-chat-loader"></span>
                                <strong>Đang tải cuộc trò chuyện</strong>
                                <p>Chờ một chút nhé...</p>
                            </div>
                        ) : !userInfo ? (
                            <div className="community-chat-state community-chat-login-state">
                                <span><i className="bi bi-chat-heart"></i></span>
                                <strong>Tham gia cuộc trò chuyện</strong>
                                <p>Đăng nhập để xem tin nhắn và kết nối với mọi người trong cộng đồng.</p>
                                <button type="button" data-bs-toggle="modal" data-bs-target="#loginClientModal">
                                    <i className="bi bi-box-arrow-in-right"></i> Đăng nhập ngay
                                </button>
                            </div>
                        ) : messageList.length === 0 ? (
                            <div className="community-chat-state">
                                <span><i className="bi bi-chat-square-dots"></i></span>
                                <strong>Hãy mở đầu cuộc trò chuyện</strong>
                                <p>Chưa có tin nhắn nào. Gửi một lời chào tới cộng đồng nhé!</p>
                            </div>
                        ) : messageList.map(row => {
                            const user = userCalled.current.get(row.sendBy) || {};
                            const currentMessage = {
                                idmessage: row._id,
                                content: row.content,
                                fileurl: user.fileAvartarUrl,
                                name: user.name || 'Thành viên',
                                replyTo: row.replyTo
                            };

                            if (idUser && idUser === row.sendBy) {
                                return (
                                    <FrameChatCurrent
                                        key={row._id}
                                        replyMessage={null}
                                        currentMessage={currentMessage}
                                        handleOnReplyClick={handleOnReplyClick}
                                        getOriginalMessage={getOriginalMessage}
                                        isHighlighted={highlightedMessageId === row._id}
                                    />
                                );
                            }
                            return (
                                <FrameChatOrder
                                    key={row._id}
                                    replyMessage={null}
                                    currentMessage={currentMessage}
                                    handleOnAnwser={handleOnAnwser}
                                    handleOnReplyClick={handleOnReplyClick}
                                    getOriginalMessage={getOriginalMessage}
                                    isHighlighted={highlightedMessageId === row._id}
                                />
                            );
                        })}
                    </div>

                    <div className="client-forum-input-section community-chat-composer">
                        <form onSubmit={formik.handleSubmit}>
                            {replySomeOne && (
                                <div className="client-reply-preview">
                                    <div className="client-reply-preview-content">
                                        <div className="client-reply-preview-icon"><i className="bi bi-reply-fill"></i></div>
                                        <div className="client-reply-preview-info">
                                            <div className="client-reply-preview-author">Đang trả lời {replySomeOne.name}</div>
                                            <div className="client-reply-preview-text">{replySomeOne.content}</div>
                                        </div>
                                    </div>
                                    <button type="button" className="client-reply-preview-close" onClick={handleOnCloseAnwser} aria-label="Hủy trả lời">
                                        <i className="bi bi-x-lg"></i>
                                    </button>
                                </div>
                            )}

                            <div className="client-forum-input">
                                <div className="client-input-wrapper">
                                    <span className="community-chat-input-icon"><i className="bi bi-chat-text"></i></span>
                                    <input
                                        type="text"
                                        maxLength="1000"
                                        disabled={!userInfo}
                                        className={`client-input-message ${formik.touched.content && formik.errors.content ? 'is-invalid' : ''}`}
                                        placeholder={userInfo ? 'Viết tin nhắn cho cộng đồng...' : 'Đăng nhập để gửi tin nhắn'}
                                        name="content"
                                        value={formik.values.content}
                                        onChange={formik.handleChange}
                                        onBlur={formik.handleBlur}
                                        autoComplete="off"
                                    />
                                    {!!formik.values.content.length && <small>{formik.values.content.length}/1000</small>}
                                </div>
                                <button type="submit" className="client-btn-send" disabled={!userInfo || !formik.values.content.trim()} aria-label="Gửi tin nhắn">
                                    <i className="bi bi-send-fill"></i>
                                </button>
                            </div>

                            {formik.touched.content && formik.errors.content && (
                                <div className="client-input-error">
                                    <i className="bi bi-exclamation-circle"></i>
                                    {formik.errors.content}
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
}
