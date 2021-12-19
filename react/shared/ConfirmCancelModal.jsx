import React, { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import storeContext from '../stores/storeContext';
import { observer } from 'mobx-react';
import { ButtonGroup } from 'react-bootstrap';

const ConfirmCancelModal = observer(() => {
    const store = useContext(storeContext);
    const { modalStore } = store;
    const { showConfirmCancelPopup, setShowConfirmCancelPopup } = modalStore;
    const { show, message, action } = showConfirmCancelPopup;

    const handleClose = () => {
        setShowConfirmCancelPopup({ show: false, message: '', action: '' });
    };

    const onConfirm = () => {
        action();
        handleClose();
    }

    return (
        <div>
            <Modal
                size='sm'
                aria-labelledby='contained-modal-title-vcenter'
                centered
                backdrop='static'
                show={show}
                onHide={handleClose}
            >
                <Modal.Header>
                    <Modal.Title> <i className='far fa-lightbulb' />
                        &nbsp; LampLighter.Social
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message}
                </Modal.Body>
                <Modal.Footer>
                    <ButtonGroup>
                        <Button variant='primary'
                            onClick={() => onConfirm()}
                        >
                            <i className='fas fa-check' /> Confirm
                        </Button>
                        <Button variant='secondary'
                            onClick={handleClose}
                        >
                            <i className='fas fa-times' /> Cancel
                        </Button>
                    </ButtonGroup>
                </Modal.Footer>
            </Modal>
        </div>
    );
});
export default ConfirmCancelModal;