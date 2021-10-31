import React, { useEffect, useState } from 'react';
import { Col, Image, Row } from 'react-bootstrap';
import { getUser } from '../../user/user_api';
import './conversations.css'
import socket from '../../shared/socket'
import {ConvLoader} from '../Loaders';
import { DateTime } from 'luxon';

const Conversations = (props) => {
    const { conversation, loggedInUserId } = props;
    const [chatter, setChatter] = useState(null);
    const [hasUnread, setHasUnread] = useState(null)
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';

    useEffect(() => {
        socket.on('getMessage', (data) => {
            const chatterHasUnreadMsg = conversation?.members?.includes(data.senderId) ? true : false
            setHasUnread(chatterHasUnreadMsg)
        })
        socket.on('markMsgsRead', (data) => {
            const chatterHasUnreadMsg = conversation?.members?.includes(data.receiverId) ? true : false
            setHasUnread(chatterHasUnreadMsg)
        })
    }, []);
    useEffect(() => {
        const chatterId = conversation?.members?.find(m => m !== loggedInUserId)
        getUser({ userId: chatterId })
            .then((res) => {
                setChatter(res.data) 
                // need to figure out how to display a dot on component load if User has unread msgs from chatter
                // const chatterHasUnreadMsg = conversation?.members?.includes(loggedInUserId) ? true : false
                // setHasUnread(chatterHasUnreadMsg)
                // console.log(res.data)
            })
            .catch((err) => console.error(err))

    }, [conversation, loggedInUserId])

    if (!chatter) return <ConvLoader />;

    return (
        <>
            <Row className='conversation'>
                <Col xs={2.5}>
                    <Image
                        className={hasUnread ? 'conversationImgUnread' : 'conversationImg'}
                        src={chatter?.avatar || blankAvatar}
                        alt={chatter?.userHandle} />
                </Col>
                <Col>
                    <div className='conversationName'>{chatter?.userHandle} {'  '}
                    {hasUnread && <i className='fas fa-circle fa-xs conversationNewMsgIcon'></i>}
                    </div>
                    <div className='conversationTime'>{DateTime.fromMillis(parseInt(conversation?.timestamp)).toRelative()}{'  '}</div>
                </Col>
            </Row>
        </>
    );
}
export default Conversations;