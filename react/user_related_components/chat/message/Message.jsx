import React from 'react'
import './message.css'
import { DateTime } from 'luxon';
import { OverlayTrigger, Tooltip, Image } from 'react-bootstrap';

const Message = (props) => {
    const { message, own, currentChatter, loggedInUser, handleDeleteMessage } = props
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
                                : 'fas fa-reply messageActionIcon'} />
                        </Tooltip>
                    }>
                    <div className='messageTop'>
                        <Image
                            className={'messageImg'}
                            src={own ? loggedInUser?.avatar : currentChatter?.avatar || blankAvatar}
                            alt={own ? loggedInUser?.userHandle : currentChatter?.userHandle} />
                        <div className='messageText'>
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