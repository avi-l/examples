import React, { useContext } from 'react'
import { Modal } from 'react-bootstrap';
import storeContext from '../../stores/storeContext';
import { observer } from 'mobx-react';
import './StartChatModal.css'
import SearchUsers from '../user/SearchUsers';

const StartChatModal = observer(() => {
    const store = useContext(storeContext);
    const { modalStore } = store;
    const { showStartChatModal, setShowStartChatModal } = modalStore;

    const handleClose = () =>  setShowStartChatModal(false);

    return (
        <Modal className='start-chat-modal'
            show={showStartChatModal}
            onHide={handleClose}
        >
            <Modal.Body className='start-chat-modal-body'>
                <span className='start-chat-modal-title'>Send someone a message</span>
                <SearchUsers />
            </Modal.Body>
        </Modal>

    );
})
export default StartChatModal;