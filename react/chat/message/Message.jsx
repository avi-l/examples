import React from 'react'
import './message.css'
import { DateTime } from 'luxon';
import { OverlayTrigger, Tooltip, Image } from 'react-bootstrap';

const Message = (props) => {
    const { message, own, currentChat, loggedInUser,
        handleDeleteMessage, handleReplyMessage } = props;
    const { quotedMessageText, quotedMessageDeleted } = message;
    const replyUserHandle = message.replyQuoteUserDetails?.userHandle || message.replyUserHandle;

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
                                onClick={() => handleReplyMessage(message,
                                    message?.senderId === loggedInUser.userId ? loggedInUser?.userHandle : currentChat?.userHandle)} />
                        </Tooltip>
                    }>
                    <div className='messageWrapper'>
                        <Image
                            className={'messageImg'}
                            src={own ? loggedInUser?.avatar : currentChat?.avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null; // prevents looping
                                currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
                            }}
                            alt={own ? loggedInUser?.userHandle : currentChat?.userHandle} />
                        <div className='messageText'>
                            {quotedMessageText &&
                                <div className={own ? 'quotedMessageText own' : 'quotedMessageText'}>
                                    {replyUserHandle &&
                                        <><div className={loggedInUser?.userHandle === replyUserHandle
                                            ? 'quotedMessageUserHandle own'
                                            : 'quotedMessageUserHandle'}>
                                            {replyUserHandle}
                                        </div></>
                                    }
                                   {quotedMessageText}  
                                   {quotedMessageDeleted && 
                                    <span className='quotedMessageTextDeleted'>{' '}(deleted)</span>
                                   }
                                </div>
                            }
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