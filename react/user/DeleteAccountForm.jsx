import React, { useContext, useState } from 'react';
import { forceReload } from '../../utilities/forceReload';
import { observer } from 'mobx-react';
import Button from 'react-bootstrap/Button';
import storeContext from '../../stores/storeContext';
import { deleteUserInAws, logout } from './userManagement';
import './DeleteAccountForm.css';
import { deactivateUser } from './user_api';
import { toast } from 'react-toastify';
import { ButtonGroup, Card } from 'react-bootstrap';

const DeleteAccountForm = observer(() => {
    const [isLoading, setIsloading] = useState(false);
    const store = useContext(storeContext);
    const { modalStore, userStore } = store;
    const { user: { userId } } = userStore;
    const { setShowConfirmCancelPopup } = modalStore;

    const MESSAGES = {
        confirm: `Are you sure you wish to deactivate your account?`,
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
        <div className='deactivateAccount-card-container'>
            <div className='deactivateAccount-card-center'>
                <Card>
                    <Card.Body>
                        We'll be sorry to see you leave!
                    </Card.Body>
                    <Card.Footer className='btnGroup'>
                        <ButtonGroup>
                            {!isLoading
                                ? <>
                                    <Button
                                        variant='primary'
                                        onClick={() => setShowConfirmCancelPopup({ show: true, message: MESSAGES.confirm, action: deleteAccount })}
                                    >
                                        Deactivate
                                    </Button>
                                    <Button
                                        variant='secondary'
                                        onClick={() => forceReload('/profile')}
                                    >
                                        Cancel
                                    </Button>
                                </>
                                : <>
                                    <Button variant='secondary' >
                                        <i className='fas fa-spinner fa-pulse' /> Deactivating... &nbsp;
                                    </Button>
                                </>
                            }
                        </ButtonGroup>
                    </Card.Footer>
                </Card>
            </div>

        </div>
    );
});
export default DeleteAccountForm;