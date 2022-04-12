import React from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { ButtonGroup } from 'react-bootstrap';
import './ConfirmCancelModal.css'

const ConfirmCancelModal = (props) => {
    const { show, message, action, close } = props;
    if (!show) return null;
    
    const handleClose = () => close();
    
    const onConfirm = () => {
        action();
        handleClose();
    }

    return (
        <div>
            <Modal className='confirmCancel-modal'
                size='sm'
                aria-labelledby='contained-modal-title-vcenter'
                centered
                backdrop='static'
                show={show}
                onHide={handleClose}
            >
                <Modal.Header className='confirmCancel-modal-header'>
                    <Modal.Title className='confirmCancel-modal-title'> <i className='far fa-lightbulb' />
                        &nbsp; REPLACE_HOSTNAME.Social
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className='confirmCancel-modal-body'>
                    {message}
                </Modal.Body>
                <Modal.Footer className='confirmCancel-modal-footer'>
                        <Button size='sm' variant='outline-primary'
                            onClick={() => onConfirm()}
                        >
                            <i className='fas fa-check' /> Confirm
                        </Button>
                        <Button size='sm' variant='outline-info'
                            onClick={handleClose}
                        >
                            <i className='fas fa-times' /> Cancel
                        </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};
export default ConfirmCancelModal;