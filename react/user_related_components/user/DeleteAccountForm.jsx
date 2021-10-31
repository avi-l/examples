import React, { useContext, useState } from 'react';
import { forceReload } from '../../utilities/forceReload';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import storeContext from '../../stores/storeContext';
import { deleteUserInAws, logout } from './userManagement';
import './ChangePassword.css';
import { deactivateUser } from './user_api';
import { toast } from 'react-toastify';

const DeleteAccountForm = observer(() => {
    const [isLoading, setIsloading] = useState(false);
    const store = useContext(storeContext);
    const { modalStore, userStore } = store;
    const { user } = userStore;
    const { setShowConfirmCancelPopup } = modalStore;

    const MESSAGES = {
        confirm: `Are you sure you wish to deactivate your account?`,
        success: `Your account has been deactivated. We hope you sign up again soon!`,
        failure: `There was an issue with deactivating your account. Please try again`,
    }
    const deleteAccount = () => {
        setIsloading(true);
        deactivateUser({
            userId: user.userId,
            active: false,
        })
            .then((res) => {
                deleteUserInAws(true)
                    .then((res) => {
                        toast.success(MESSAGES.success, { position: 'top-center' })
                        logout()
                    })
                    .catch((err) => {
                        toast.error(`${MESSAGES.failure} : ${err}`, { position: 'top-center' })
                        setIsloading(false)
                    });
                setIsloading(false)
            })
            .catch((err) => {
                toast.error(`${MESSAGES.failure} : ${err}`, { position: 'top-center' })
                setIsloading(false)
            });
    }

    return (
        <div id='delete-account-form'>
            <Form className='DeleteAccount'>
                <Form.Group className='input-group'>
                    {!isLoading &&
                        <Button
                            variant='primary'
                            onClick={() => setShowConfirmCancelPopup({ show: true, message: MESSAGES.confirm, action: deleteAccount })}
                        >
                            <i className='fas fa-user-times' /> Deactivate
                        </Button>
                    }
                </Form.Group>
                <Form.Group>
                    {!isLoading &&
                        <Button
                            variant='secondary'
                            onClick={() => forceReload('/profile')}
                        >
                            <i className='fas fa-sign-in-alt fa-flip-horizontal' /> Cancel
                        </Button>
                    }
                    {isLoading &&
                        <Button variant='secondary' >
                            <i className='fas fa-spinner fa-pulse' /> Deactivating Account... &nbsp;
                        </Button>
                    }
                </Form.Group>
            </Form>
        </div>
    );
});
export default DeleteAccountForm;