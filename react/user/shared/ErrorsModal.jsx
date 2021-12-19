import React, { useContext } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import { forceReload } from '../../../utilities/forceReload';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';

const ErrorsModal = observer(() => {
    const store = useContext(storeContext);
    const { modalStore } = store;
    const { showErrorPopup, setShowErrorPopup } = modalStore;
    const { show, message, tryAgain } = showErrorPopup;

    const handleClose = () => {
        setShowErrorPopup({ show: false, message: '', tryAgain: false });
    };

    const goHome = () => {
        handleClose();
        forceReload('/');
    };

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
                        &nbsp; REPLACE_HOSTNAME.Social
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {message}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant='primary' onClick={goHome}>
                        <i className='fas fa-home' /> Home
                    </Button>
                    {tryAgain &&
                        <Button variant='secondary' onClick={handleClose} >
                            <i className='fas fa-redo' /> Try Again
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
        </div>
    );
});
export default ErrorsModal;