import React from 'react';

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
    const { replyMessage, currentMessage } = props;



















    return (
        <>
            <div className="client-msg-item client-msg-reply">
                <div className="client-msg-avatar">
                    <img src={`${currentMessage.fileurl}`} alt="Expert" className="client-avatar-photo" />
                </div>
                <div className="client-msg-body">
                    <div className="client-msg-header">
                        <span className="client-msg-name">{currentMessage.name}</span>
                        <span className="client-badge-expert">{currentMessage.role_name}</span>
                    </div>

                    {/* chat repyly co mnoi hien ra */}
                    {

                        replyMessage ? <div className="client-msg-replied">
                            <div className="client-replied-author">Hoàng Nam</div>
                            <div className="client-replied-text">Mọi người cho mình hỏi ngành Marketing của NEU...</div>
                        </div> : null
                    }


                    <div className="client-msg-content">
                        {currentMessage.content}
                    </div>

                </div>
            </div>
        </>
    );
}
