import React, { useState } from 'react';
import { Col, Container, Row, } from 'react-bootstrap';
import GenericModal from '../shared/GenericModal';
import SearchUsers from '../user/SearchUsers';

const DisplayStartNewChat = () => {
    const [showSearchUsersModal, setShowSearchUsersModal] = useState(false)

    return (
        <>
            {showSearchUsersModal && <GenericModal
                show={true}
                title={'Send Someone A Message'}
                body={<SearchUsers />}
                close={() => setShowSearchUsersModal(false)}
            />}
           
            <Container fluid className='startChatWrapper' onClick={() => setShowSearchUsersModal(true)}>
         
                <Row>
                    <Col>
                        <i className='far fa-comment-dots fa-5x startChatIcon'/>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <span className='startChatText'>Click to start a new chat
                            <br /> or click on a conversation</span>
                    </Col>
                </Row>
            </Container>
        </>
    )
}
export default DisplayStartNewChat;