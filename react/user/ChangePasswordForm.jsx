import React, { useState, useContext } from 'react';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import storeContext from '../../stores/storeContext';
import { isUserLoggedIn, changeUserPass } from './userManagement';
import './ChangePassword.css';
import PasswordChecklist from 'react-password-checklist'
import { sendEmailToUser } from '../email/sendEmail_api';
import { ButtonGroup, Card } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useHistory } from 'react-router-dom';

const ChangePasswordForm = observer(() => {
    const [isLoading, setIsLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const store = useContext(storeContext);
    const { modalStore, loginStore } = store;
    const { password, setPassword, passwordCopy, setPasswordCopy } = loginStore;
    const { setShowErrorPopup } = modalStore;
    const history = useHistory()

    const onSuccess = (currentUser) => {
        const toastOptions = {
            position: 'top-center',
            autoClose: 2500,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            onClose: () => {
                setPassword('')
                setPasswordCopy('')
                setOldPassword('')
                setIsLoading(false)
            }
        };
        toast.success(`Success!`, toastOptions)
        const { email } = currentUser.attributes
        const MESSAGES = {
            subject: `REPLACE_HOSTNAME.Social Password Changed`,
            body: `Hello ${currentUser.attributes.preferred_username || currentUser.attributes.username}! 
              You have successfully changed your password. 
              Thank you for taking security seriously. 
              -REPLACE_HOSTNAME.Social Team`,
        }
        sendEmailToUser({ email, subject: MESSAGES.subject, body: MESSAGES.body })
    }

    const onError = (res) => {
        const message = res.message || res;
        const tryAgain = res.code !== 'LimitExceededException';
        setShowErrorPopup({ show: true, message, tryAgain });
        setIsLoading(false);
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        const currentUser = await isUserLoggedIn(true)
        if (!currentUser.attributes) return onError(currentUser)
        const res = await changeUserPass(currentUser, oldPassword, password)
        if (res !== 'SUCCESS') return onError(res);
        return onSuccess(currentUser)
    }

    return (
        <div classname='changePass-card-container'>
            <div className='changePass-card-center'>
                <Card >
                    <Card.Header as='h5'>Change Password</Card.Header>
                    <Card.Body>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group>
                                <Form.Control
                                    type='password'
                                    id='inputOldPassword'
                                    className='form-control'
                                    placeholder='Current Password'
                                    value={oldPassword}
                                    onChange={(e) =>
                                        setOldPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className='input-group'>
                                <Form.Control
                                    type='password'
                                    id='inputPassword'
                                    className='form-control'
                                    placeholder='Password'
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)}
                                    required
                                />
                            </Form.Group>
                            <Form.Group className='input-group' >
                                <Form.Control
                                    type='password'
                                    id='passwordCopy'
                                    className='form-control'
                                    placeholder='Confirm Password'
                                    onChange={(e) =>
                                        setPasswordCopy(e.target.value)}
                                    value={passwordCopy}
                                    required
                                />
                            </Form.Group>
                            {password !== '' &&
                                <Form.Group className='password-validator'>
                                    <PasswordChecklist
                                        rules={['length', 'specialChar', 'number', 'capital', 'match']}
                                        minLength={8}
                                        value={password}
                                        valueAgain={passwordCopy}
                                    />
                                </Form.Group>}
                            <Card.Footer className='btnGroup'>
                                <ButtonGroup>
                                    {!isLoading
                                        ? <>
                                            <Button
                                                variant='primary'
                                                type='sumbit'
                                            >
                                                Change
                                            </Button>
                                            <Button
                                                variant='secondary'
                                                onClick={() => history.push('/profile')}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                        : <>
                                            <Button variant='secondary' >
                                                <i className='fas fa-spinner fa-pulse' /> Changing... &nbsp;
                                            </Button>
                                        </>
                                    }
                                </ButtonGroup>
                            </Card.Footer>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
});
export default ChangePasswordForm;