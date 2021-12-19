import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import './conversations.css'
import socket from '../../shared/socket'
import { DateTime } from 'luxon';

const Conversations = (props) => {
    const { conversationData: { userId, avatar, userHandle, timestamp} } = props;
    const [hasUnread, setHasUnread] = useState(null);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';
    
    useEffect(() => {
        socket.on('getMessage', (data) => {
            const chatterHasUnreadMsg = userId === data?.senderId ? true : false
            setHasUnread(chatterHasUnreadMsg)
        })
        socket.on('markMsgsRead', (data) => {
            const chattingWithUser = userId === data?.receiverId ? true : false
            setSelectedConversation(chattingWithUser);
        })
    }, [userId]);

    return (
        <>
            <Row className={selectedConversation ? 'conversation-selected' : 'conversation'}>
                <Col xs={2.5}>
                    <Image
                        className={hasUnread ? 'conversationImgUnread' : 'conversationImg'}
                        src={avatar || blankAvatar}
                        alt={userHandle} />
                </Col>
                <Col>
                    <div className='conversationName'>{userHandle} {'  '}
                    {/* {hasUnread && <i className='fas fa-circle fa-xs conversationNewMsgIcon'></i>} */}
                    </div>
                    <div className='conversationTime'>{DateTime.fromMillis(parseInt(timestamp)).toRelative()}{'  '}</div>
                </Col>
            </Row>
        </>
    );
}
export default Conversations;