import React from 'react'
import './messagePreview.css'
import { DateTime } from 'luxon';
import { Col, Image, Row } from 'react-bootstrap';
import { forceReload } from '../../../utilities/forceReload';

const MessagePreview = (props) => {
    const { message } = props;
    if (!message.messageId) return  <div className='messagePreviewNoMsgs' onClick={() => forceReload('/chat')}>No Messages</div>;
    return (
        <>
            <Row className='messagePreviewRow' onClick={() => forceReload('/chat/?friend=' + message.senderId)}>
                <Col xs={2}>
                    <Image
                        className={'messagePreviewImg'}
                        src={message.avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
                        onError={({ currentTarget }) => {
                            currentTarget.onerror = null; // prevents looping
                            currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
                        }}
                    />
                </Col>
                <Col className='messagePreviewContent'>
                    <div className='messagePreviewUserHandle'>
                        {message?.userHandle}
                    </div>
                    <div className='messagePreviewText'>
                        {message?.text}
                    </div>
                    <div className='messagePreviewDate'>
                        {DateTime.fromMillis(parseInt(message?.timestamp)).toRelative()}
                    </div>
                </Col>
            </Row>
        </>
    );
}
export default MessagePreview;