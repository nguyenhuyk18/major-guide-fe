import React from 'react';

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
    const { replyMessage, currentMessage } = props;


    return (
        <>
            <div className="client-msg-item">
                <div className="client-msg-avatar">
                    <img src={`${currentMessage.fileurl}`} alt="Expert" className="client-avatar-photo" />
                </div>
                <div className="client-msg-body">
                    <div className="client-msg-header">
                        <span className="client-msg-name">{currentMessage.name}</span>
                        {/* <span className="client-msg-time">Hôm nay lúc 10:30 h</span> */}
                    </div>

                    {/* Co reply to moi hien ra */}
                    {replyMessage ? <div className="client-msg-replied-other">
                        <div className="client-replied-author-other">Hoàng Nam</div>
                        <div className="client-replied-text-other">Mọi người cho mình hỏi ngành Marketing của NEU...</div>
                    </div> : ''}

                    <div className="client-msg-content">
                        {currentMessage.content}
                    </div>
                    <button className="client-msg-reply-btn">Trả lời</button>
                </div>
            </div>
        </>
    );
}
