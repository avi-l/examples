import React from 'react'
import { CloseButton, Modal } from 'react-bootstrap';
import './GenericModal.css'

const GenericModal = (props) => {
    const { show, title, body, footer, close } = props;
    if (!show) return null;

    return (
        <Modal 
            show={show}
            onHide={close}
            centered
            size='md'
        >
            <div className='generic-modal-closeBtn'>
                <CloseButton onClick={() => close()} />
            </div>
            <Modal.Header className='generic-modal-header'>
                <Modal.Title className='generic-modal-title'>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body className='generic-modal-body'>
                {body}
            </Modal.Body>
            <Modal.Footer className='generic-modal-footer'>
                {footer}
            </Modal.Footer>
        </Modal>
    );
}
export default GenericModal;