import React, { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

export default function FrameChatCurrent(props) {

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

    const { currentMessage, handleOnReplyClick, getOriginalMessage, isHighlighted } = props;


    const isReply = currentMessage.replyTo && currentMessage.replyTo !== '';
    // const call
    // console.log(isReply)

    useEffect(() => {
        if (isReply) {
            getReplyChat(currentMessage.replyTo)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])





    const getReplyChat = async (id_reply) => {
        try {
            const rs = await getOriginalMessage(id_reply);
            setOrignalMessage(rs);
        } catch (error) {
            toast.error('Lỗi đã xảy ra  1 !!!')
        }
    }









    // Check if this message is a reply

    // const originalMessage = isReply ? getOriginalMessage(currentMessage.replyTo) : null;

    return (
        <>
            <div className={`client-msg-item client-msg-reply ${isReply ? 'client-msg-reply-item' : ''} ${isHighlighted ? 'highlighted' : ''}`} id={currentMessage.idmessage}>
                <div className="client-msg-avatar">
                    <img src={`${currentMessage.fileurl}`} alt="Expert" className="client-avatar-photo" />
                </div>
                <div className={`client-msg-body ${isReply ? 'client-msg-reply-item' : ''} ${isHighlighted ? 'highlighted' : ''}`}>
                    <div className="client-msg-header">
                        <span className="client-msg-name">{currentMessage.name}</span>
                        <span className="client-badge-expert">{currentMessage.role_name}</span>
                    </div>

                    {/* Hiển thị tin nhắn reply nếu có */}
                    {isReply && originalMessage ? (
                        <div className="client-msg-replied" onClick={() => handleOnReplyClick(originalMessage._id)}>
                            <div className="client-replied-author">Đang trả lời: {originalMessage.name}</div>
                            <div className="client-replied-text">{originalMessage.content}</div>
                        </div>
                    ) : ''}

                    <div className="client-msg-content">
                        {currentMessage.content}
                    </div>

                </div>
            </div>
        </>
    );
}
