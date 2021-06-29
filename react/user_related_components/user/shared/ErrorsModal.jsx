import React, { useContext, useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import Button from "react-bootstrap/Button";
import { forceReload } from '../../../utilities/forceReload';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import { logout } from '../userManagement';

const ErrorsModal = observer(() => {
    const store = useContext(storeContext);
    const { modalStore } = store;
    const { showErrorPopup, setShowErrorPopup } = modalStore;
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = () => {
        setIsLoading(true);
        setShowErrorPopup(
            {
                show: false,
                message: "",
                tryAgain: false,
                signOut: false
            });
        setIsLoading(false);
    };

    const goHome = () => {
        handleClose();
        forceReload('/');
    };
    // user is logged in but not yet a contributor
    // they have a valid contrib link and have
    // agreed to have us upgrade their account to contrib
    const upgradeToContributor = () => {
        setIsLoading(true);
        setShowErrorPopup(
            {
                show: false,
                message: "",
                tryAgain: false,
                signOut: false,
                makeContributor: true
            });
    };
    // we have sent their contrib code to cognito
    // /userCheck will see that attribute in cognito
    // and then mark the code used
    const continueAsContributor = () => {
        handleClose();
        forceReload('/userCheck');
    };

    const logOut = () => {
        handleClose();
        logout();
    };

    const remain = () => {
        handleClose();
    };

    return (
        <div>
            <Modal
                size='md'
                centered
                backdrop='static'
                show={showErrorPopup.show}
                onHide={handleClose}
            >
                <Modal.Header>
                    <Modal.Title> <i className={'far fa-lightbulb'} />
                    &nbsp; FILL_IN_THE_BLANK
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {showErrorPopup.message}
                </Modal.Body>
                <Modal.Footer>
                    {!showErrorPopup.signOut &&
                        !showErrorPopup.isLoggedIn &&
                        !showErrorPopup.goHomeAsContributor &&
                        !isLoading &&
                        <Button variant="secondary"
                            onClick={goHome}
                        >
                            <i className="fas fa-home" /> Home
                    </Button>}
                    {showErrorPopup.tryAgain &&
                        !showErrorPopup.isLoggedIn &&
                        !isLoading &&
                        <Button
                            type='button'
                            className='btn btn-secondary'
                            onClick={remain}
                        >
                            <i className="fas fa-redo" /> Try Again
                </Button>}
                    {showErrorPopup.signOut &&
                        !isLoading &&
                        <Button
                            type='button'
                            className='btn btn-secondary'
                            onClick={logOut}
                        >
                            <i className="fas fa-sign-out" /> Sign Out
                </Button>}
                    {showErrorPopup.isLoggedIn &&
                        !isLoading &&
                        <Button
                            type='button'
                            className='btn btn-secondary'
                            onClick={upgradeToContributor}
                        >
                            <i className="fas fa-user-plus" /> Yes, make me a Contributor!
                </Button>}
                    {showErrorPopup.isLoggedIn &&
                        !isLoading &&
                        <Button
                            type='button'
                            className='btn btn-secondary'
                            onClick={goHome}
                        >
                            <i className="fas fa-home" /> Not now
                </Button>
                    }
                    {showErrorPopup.goHomeAsContributor &&

                        <Button
                            type='button'
                            className='btn btn-secondary'
                            onClick={continueAsContributor}
                        >
                            <i className="fas fa-home" /> Continue to FILL_IN_THE_BLANK
                </Button>
                    }
                    {!showErrorPopup.goHomeAsContributor &&
                        isLoading &&
                        <Button
                            className="btn form-control submit"
                            type="button"
                            id="btn-signup"
                        >
                            Loading... &nbsp;
                <i className="fas fa-spinner fa-pulse"></i>
                        </Button>
                    }
                </Modal.Footer>
            </Modal>
        </div>
    );
});
export default ErrorsModal;