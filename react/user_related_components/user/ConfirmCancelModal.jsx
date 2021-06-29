import React, { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";
import storeContext from '../stores/storeContext';
import { observer } from 'mobx-react';

const ConfirmCancelModal = observer(() => {
    const store = useContext(storeContext);
    const { modalStore } = store;
    const { showConfirmCancelPopup, setShowConfirmCancelPopup } = modalStore;
    const { show, message, action } = showConfirmCancelPopup;

    const handleClose = () => {
        setShowConfirmCancelPopup({ show: false, message: '', action: '' });
    };

    const onConfirm = (action) => {
        action();
        handleClose();
    }

    return (
        <div>
            <Modal
                size='md'
                centered
                backdrop='static'
                show={show}
                onHide={handleClose}
            >
                <Modal.Header>
                    <Modal.Title> <i className={'far fa-lightbulb'} />
                    &nbsp; FILL_IN_THE_BLANK
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message}
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        type='button'
                        className='btn btn-secondary'
                        onClick={() => onConfirm(action)}
                    >
                        <i className="fas fa-check" /> Confirm
                </Button>
                    <Button
                        type='button'
                        className='btn btn-secondary'
                        onClick={handleClose}
                    >
                        <i className="fas fa-times" /> Cancel
                </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
});
export default ConfirmCancelModal;