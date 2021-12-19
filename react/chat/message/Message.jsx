import React from 'react'
import './message.css'
import { DateTime } from 'luxon';
import { OverlayTrigger, Tooltip, Image } from 'react-bootstrap';

const Message = (props) => {
    const { message, own, currentChat, loggedInUser,
        handleDeleteMessage, handleReplyMessage } = props;
    //  console.log(message)
    const replyQuote = message.replyQuoteText?.text;
    const replyUserDetails = message.replyQuoteUserDetails;
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';

    return (
        <>
            <div className={own ? 'message own' : 'message'}>
                <OverlayTrigger
                    trigger='click'
                    rootClose
                    placement={message?.senderId === loggedInUser.userId ? 'left' : 'right'}
                    overlay={
                        <Tooltip bsPrefix={message?.senderId === loggedInUser.userId
                            ? 'messageActions own'
                            : 'messageActions'}
                        >
                            {message?.senderId === loggedInUser.userId &&
                                <i className={message?.senderId === loggedInUser.userId
                                    ? 'fas fa-trash-alt messageActionIcon own'
                                    : 'fas fa-trash-alt messageActionIcon'}
                                    onClick={() => handleDeleteMessage(message)}
                                />}
                            {'  '}
                            <i className={message?.senderId === loggedInUser.userId
                                ? 'fas fa-reply messageActionIcon own'
                                : 'fas fa-reply messageActionIcon'}
                                onClick={() => handleReplyMessage(message, currentChat?.userHandle)} />
                        </Tooltip>
                    }>
                    <div className='messageWrapper'>
                        <Image
                            className={'messageImg'}
                            src={own ? loggedInUser?.avatar : currentChat?.avatar || blankAvatar}
                            alt={own ? loggedInUser?.userHandle : currentChat?.userHandle} />

                        <div className='messageText'>
                            <div className={own ? 'quotedMessageText own' : 'quotedMessageText'}>
                                {replyUserDetails?.userHandle &&
                                    <><div className={loggedInUser?.userHandle === replyUserDetails?.userHandle
                                        ? 'quotedMessageUserHandle own'
                                        : 'quotedMessageUserHandle'}>
                                        {replyUserDetails?.userHandle}
                                    </div></>
                                }
                                {replyQuote}
                            </div>
                            {message?.text}
                        </div>
                        <div className='messageDate'>
                            {DateTime.fromMillis(parseInt(message?.timestamp)).toRelative()}
                        </div>
                    </div>
                </OverlayTrigger>
            </div>
        </>
    );
}
export default Message;