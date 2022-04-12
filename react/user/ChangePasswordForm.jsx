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
    const { loginStore } = store;
    const { password, setPassword, passwordCopy, setPasswordCopy } = loginStore;
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
            }
        };
        toast.success(`Success!`, toastOptions)
        const { email } = currentUser.attributes
        const timestamp = Date()
        const MESSAGES = {
            subject: `REPLACE_HOSTNAME.Social Password Changed`,
            body: `
            Hello ${currentUser.attributes.preferred_username || currentUser.attributes.username}! 
            At ${timestamp} you successfully changed your password. 
            Thank you for taking security seriously. 
            -REPLACE_HOSTNAME.Social Security Team`,
        }
        sendEmailToUser({ email, subject: MESSAGES.subject, body: MESSAGES.body })
        setIsLoading(false)
    }

    const onError = (res) => {
        const message = res.message || res;
        setIsLoading(false);
    toast.error(message, { position: 'top-center'})
        return
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
        <div className='changePass-card-html'>
            <div className='changePass-card-wrapper'>
                <Card className='changePass-card'>
                    <Card.Header className='changePass-card-header'>Change Password</Card.Header>
                    <Card.Body className='changePass-card-body'>
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
                            <Form.Group className='changePass-card-input-group'>
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
                            <Form.Group className='changePass-card-input-group' >
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
                            <Form.Group className='changePass-password-checklist'>
                                {password !== '' &&
                                    <PasswordChecklist
                                        rules={['minLength', 'specialChar', 'number', 'capital', 'match']}
                                        minLength={8}
                                        value={password}
                                        valueAgain={passwordCopy}
                                    />
                                }
                            </Form.Group>
                            <Card.Footer className='changePass-card-footer'>
                                    <Button 
                                        block
                                        variant='primary'
                                        type='submit'
                                        disabled={!oldPassword || password === '' || password !== passwordCopy}
                                    >
                                        {!isLoading ? 'Submit' : <span> Changing Password... &nbsp;<i className='fas fa-spinner fa-pulse' /></span> }
                                    </Button>
                            </Card.Footer>
                        </Form>
                    </Card.Body>
                </Card>
            </div>
        </div>
    );
});
export default ChangePasswordForm;