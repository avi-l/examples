import React, { useContext, useState } from 'react';
import { forceReload } from '../../utilities/forceReload';
import { observer } from 'mobx-react';
import Button from 'react-bootstrap/Button';
import storeContext from '../../stores/storeContext';
import { deleteUserInAws, logout } from './userManagement';
import './DeleteAccountForm.css';
import { deactivateUser } from './user_api';
import { toast } from 'react-toastify';
import { Card } from 'react-bootstrap';
import ConfirmCancelModal from '../../utilities/ConfirmCancelModal';

const DeleteAccountForm = observer(() => {
    const [isLoading, setIsloading] = useState(false);
    const [showConfirmCancelModal, setShowConfirmCancelModal] = useState({ show: false, message: '', action: '' })
    const { show, message, action } = showConfirmCancelModal;
    const store = useContext(storeContext);
    const { userStore } = store;
    const { user: { userId } } = userStore;

    const MESSAGES = {
        confirm: `Are you sure you wish to deactivate your account? `,
        success: `Your account has been deactivated. We hope you sign up again soon!`,
        failure: `There was an issue with deactivating your account. Please try again`,
    }
    const deleteAccount = async () => {
        setIsloading(true);
        try {
            await deleteUserInAws(true)
            await deactivateUser({ userId, active: false })
            toast.success(MESSAGES.success, { position: 'top-center', onClose: () => logout() })
        } catch (error) {
            toast.error(`${MESSAGES.failure} : ${error}`, { position: 'top-center' })
            setIsloading(false)
        }
    }

    return (
        <div className='deactivateAccount-card-page'>
            <ConfirmCancelModal
                show={show}
                message={message}
                action={action}
                close={() => setShowConfirmCancelModal({ show: false, message: '', action: '' })}
            />
            <div className='deactivateAccount-card-wrapper'>
                <Card className='deactivateAccount-card-center' border='danger'>
                    <Card.Header className='deactivateAccount-card-header'>
                        <i className="fas fa-exclamation-triangle"></i>
                        Deactivate Account
                        <i className="fas fa-exclamation-triangle"></i>
                    </Card.Header>
                    <Card.Body as='b'>
                        We'll be sorry to see you leave!
                    </Card.Body>
                    <Card.Footer className='deactivate-account-card-footer'>
                        {!isLoading
                            ? <>
                                <Button
                                    size='sm'
                                    className='deactivate-account-btn'
                                    variant='outline-danger'
                                    onClick={() => setShowConfirmCancelModal({ show: true, message: MESSAGES.confirm, action: deleteAccount })}
                                >
                                    Deactivate
                                </Button>
                                <Button
                                    size='sm'
                                    className='deactivate-account-btn'
                                    variant='outline-primary'
                                    onClick={() => forceReload('/profile')}
                                >
                                    Cancel
                                </Button>
                            </>
                            : <>
                                <Button size='sm' className='deactivate-account-btn' variant='secondary'>
                                    <i className='fas fa-spinner fa-pulse' /> Deactivating... &nbsp;
                                </Button>
                            </>}
                    </Card.Footer>
                </Card>
            </div>
        </div>
    );
});
export default DeleteAccountForm;
