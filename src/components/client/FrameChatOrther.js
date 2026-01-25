import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function FrameChatOrder(props) {
    // current message
    // {
    //     idmessage,
    //         content,
    //    fileurl,
    //  name ,
    // }

    // replymessage
    // {
    //     // name
    //     // idmessage
    //     // content
    // }
    const [originalMessage, setOrignalMessage] = useState();
    const { currentMessage, handleOnAnwser, handleOnReplyClick, getOriginalMessage, isHighlighted } = props;
    const isReply = currentMessage.replyTo && currentMessage.replyTo !== '';
    console.log(originalMessage)
    useEffect(() => {
        if (isReply) {
            getReplyChat(currentMessage.replyTo)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    // Check if this message is a reply

    // const originalMessage = isReply ? getOriginalMessage(currentMessage.replyTo) : null;

    const getReplyChat = async (id_reply) => {
        try {
            const rs = await getOriginalMessage(id_reply);
            setOrignalMessage(rs);
        } catch (error) {
            toast.error('Lỗi đã xảy ra  1 !!!')
        }
    }

    return (
        <>
            <div className={`client-msg-item `} id={currentMessage.idmessage}>
                <div className="client-msg-avatar">
                    <img src={`${currentMessage.fileurl}`} alt="Expert" className="client-avatar-photo" />
                </div>
                <div className={`client-msg-body ${isReply ? 'client-msg-reply-item' : ''} ${isHighlighted ? 'highlighted' : ''} `}>
                    <div className="client-msg-header">
                        <span className="client-msg-name">{currentMessage.name}</span>
                        {/* <span className="client-msg-time">Hôm nay lúc 10:30 h</span> */}
                    </div>

                    {/* Hiển thị tin nhắn reply nếu có */}
                    {isReply && originalMessage ? (
                        <div className="client-msg-replied" onClick={() => handleOnReplyClick(originalMessage._id)}>
                            <div className="client-replied-author">Đang trả lời: {originalMessage.name}</div>
                            <div className="client-replied-text" style={{ color: '#fff' }}>{originalMessage.content}</div>
                        </div>
                    ) : ''}

                    <div className="client-msg-content">
                        {currentMessage.content}
                    </div>
                    <button className="client-msg-reply-btn" onClick={() => handleOnAnwser(currentMessage.idmessage)}>Trả lời</button>
                </div>
            </div>
        </>
    );
}
