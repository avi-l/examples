import React, { useContext } from 'react';
import storeContext from '../../stores/storeContext'
import { observer } from 'mobx-react';
import {  Col, Container, Row,  } from 'react-bootstrap';

const DisplayStartNewChat = observer(() => {
    const store = useContext(storeContext);
    const { modalStore } = store;
    const { setShowStartChatModal } = modalStore;

    return (
        <Container fluid className='startChatWrapper'>
            <Row>
                <Col>
                    <i className='far fa-comment-dots fa-5x startChatIcon'
                        onClick={() => setShowStartChatModal(true)} />
                </Col>
            </Row>
            <Row>
                <Col>
                    <span className='startChatText'>Click to start a new chat 
                    <br/> or click on a conversation</span>
                </Col>
            </Row>
        </Container>
    )
})
export default DisplayStartNewChat;