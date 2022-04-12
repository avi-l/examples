import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import './conversations.css'
import socket from '../../shared/socket'
import { DateTime } from 'luxon';

const Conversations = (props) => {
    const { conversationData: { userId, avatar, userHandle, timestamp, notifs } } = props;
    const [hasUnread, setHasUnread] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        socket.on('getMessage', (data) => {
            setHasUnread(prev => prev.concat(data.senderId))
        })
        socket.on('markMsgsRead', (data) => {
            const chattingWithUser = userId === data?.receiverId ? true : false
            setSelectedConversation(chattingWithUser);
            setHasUnread(prev => prev.filter(n => n !== data.receiverId))
        })
        notifs && userId && setHasUnread(notifs?.map(n => n.senderId) ?? [0])
        setIsLoading(false)
    }, [notifs, userId]);

    return (
        <>
            <Row className={selectedConversation ? 'conversationRow-selected' : 'conversationRow'}>
                <Col xs={2.5}>
                    <Image
                        className={hasUnread.length && hasUnread.some(u => u === userId) ? 'conversationImgUnread' : 'conversationImg'}
                        src={avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null; //prevents looping
                            currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
                        }}
                        alt={userHandle} />
                </Col>
                <Col >
                    <div className='conversationName'>{userHandle} {'  '}</div>
                    <div className='conversationTime'>{DateTime.fromMillis(parseInt(timestamp)).toRelative()}{'  '}</div>
                </Col>
                <div className={selectedConversation ? 'conversation-selected' : 'conversation'}>

                </div>
                {(hasUnread.length !== 0) && (hasUnread.some(u => u === userId)) && 
                <div className={'conversation-notification-dot'}>

                </div>
                }
            </Row>
        </>
    );
}
export default Conversations;