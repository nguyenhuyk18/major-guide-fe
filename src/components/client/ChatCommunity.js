import { useEffect, useRef, useState } from 'react';
import FrameChatCurrent from './FrameChatCurrent';
import FrameChatOrder from './FrameChatOrther';
import { getMessage, sendMessage } from '../../services/chat.api';
import { getUserAccess, getUserByIds } from '../../services/user-access.api';
import { toast } from 'react-toastify';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { io } from "socket.io-client";
import { CHAT_COMNUNITY } from '../../constants/constant';

export default function ChatCommunity() {
    const userCalled = useRef(new Map());
    const frameContainerChat = useRef(null);
    const hasMoreMessage = useRef(true);
    const page = useRef(1);
    const idUser = useSelector(state => state?.authAdminReducer?.loggedUser?.id);
    // console.log(idUser)

    const [messageList, setMessageList] = useState([]);

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
        getChatList()

        const socket = io(process.env['REACT_APP_API_URL'],
            {
                path: '/socket.io',
                transports: ['websocket']
            }
        );

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
            console.log('hahhaah')
            setMessageList(prevMessage => [...prevMessage, {
                id: id,
                sendBy: userId,
                content: message,
                replyTo: replyTo
            }])


            requestAnimationFrame(() => {
                if (isNearestBtn()) {
                    scrollToBottom();
                }

            });

        })



        return () => {
            socket.disconnect()
        }

    }, [])




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
        }
    }




    const formik = useFormik({
        // Khởi động giá trị cho thẻ nhập liệu
        initialValues: {
            content: '',
            replyTo: ''
        },
        // Kiểm tra dữ liệu hợp lệ không
        validationSchema: Yup.object({
            content: Yup.string().required('Vui lòng nhập nội dung bạn muốn nhập'),
            // password: Yup.string().required('Vui lòng nhập mật khẩu của bạn !!')
        }),

        onSubmit: async (values, { resetForm }) => {
            try {
                await sendMessage(values);
                resetForm();
                setTimeout(() => scrollToBottom, 100);
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

    return (
        <>
            <section className="client-section client-forum-section">
                <div className="container">
                    <div className="client-forum-header">
                        <div className="client-forum-icon">
                            <i className="bi bi-chat-left-text"></i>
                        </div>
                        <div>
                            <h2 className="client-forum-title">Thảo luận cộng đồng</h2>
                            <p className="client-forum-subtitle">Kết nối học viện hỏi đáp những chung cộng đồng học sinh toàn quốc</p>
                        </div>
                    </div>

                    <div className="client-forum-thread">
                        <div className="client-thread-header">
                            <div className="client-thread-avatar">
                                <img src="https://i.pravatar.cc/40?img=1" alt="User" />
                            </div>
                            <div className="client-thread-info">
                                <h4>Hỏi đáp Tuyển sinh 2024</h4>
                                {/* <p><i className="bi bi-people"></i> 1,245 thành viên online</p> */}
                            </div>
                        </div>
                        <div className="client-forum-messages" style={{
                            height: '600px',
                            overflowY: 'auto'
                        }}
                            onScroll={(e) => handleOnScroll(e)}
                            ref={frameContainerChat}
                        >

                            {messageList && messageList.length ? messageList.map(row => {

                                const user = userCalled.current.get(row.sendBy);
                                // console.log(emailUser, ' ', user);
                                if (idUser && idUser === row.sendBy) {
                                    return <FrameChatCurrent replyMessage={null} currentMessage={
                                        {
                                            idmessage: row.id,
                                            content: row.content,
                                            fileurl: user.fileAvartarUrl,
                                            name: user.name,
                                        }
                                    } />
                                }
                                return <FrameChatOrder replyMessage={null} currentMessage={
                                    {
                                        idmessage: row.id,
                                        content: row.content,
                                        fileurl: user.fileAvartarUrl,
                                        name: user.name,
                                    }} />
                            }) : ''}
                            {/* <div ref={messagesContainerRef} /> */}
                        </div>

                        <div className="client-forum-input-section">
                            <form onSubmit={formik.handleSubmit}>
                                <div className="client-forum-input">
                                    <div className="client-input-wrapper">
                                        <input
                                            type="text"
                                            className={`client-input-message ${formik.touched.content && formik.errors.content ? 'is-invalid' : ''}`}
                                            placeholder="Nhập tin nhắn của bạn..."
                                            name='content'
                                            value={formik.values.content}
                                            onChange={formik.handleChange}
                                            onBlur={formik.handleBlur}
                                        />
                                        <button type="button" className="client-btn-emoji">
                                            <i className="bi bi-emoji-smile"></i>
                                        </button>
                                    </div>
                                    <button type="submit" className="client-btn-send">
                                        <i className="bi bi-send-fill"></i>
                                    </button>
                                </div>

                                {/* Error message now inside the forum thread */}
                                {formik.touched.content && formik.errors.content && (
                                    <div className="client-input-error">
                                        <i className="bi bi-exclamation-circle me-2"></i>
                                        {formik.errors.content}
                                    </div>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </section >
        </>
    );
}
