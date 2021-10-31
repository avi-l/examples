import React, { useState, useContext } from 'react';
import { forceReload } from '../../utilities/forceReload';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import storeContext from '../../stores/storeContext';
import { isUserLoggedIn, changeUserPass } from './userManagement';
import './ChangePassword.css';
import PasswordChecklist from 'react-password-checklist'
import { sendEmailToUser } from '../email/sendEmail_api';

const ChangePasswordForm = observer(() => {
    const [isLoading, setIsLoading] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const store = useContext(storeContext);
    const { modalStore, loginStore } = store;
    const { password, setPassword,
        passwordCopy, setPasswordCopy,
    } = loginStore;
    const { setShowErrorPopup } = modalStore;

    const submitPassChange = (event) => {
        event.preventDefault();
        setIsLoading(true);
        isUserLoggedIn(true)
            .then((currentUser) => {
                changeUserPass(currentUser, oldPassword, password)
                    .then((res) => {
                        if (res === 'SUCCESS') {
                            const { email } = currentUser.attributes
                            const MESSAGES = {
                                subject: `example.com Password Changed`,
                                body: `Hello ${currentUser.attributes.preferred_username || currentUser.attributes.username}! <br/>
                                  You have successfully changed your password. 
                                  Thank you for taking security seriously. <br/>
                                  -example.com Team`,
                            }
                            sendEmailToUser({ email, subject: MESSAGES.subject, body: MESSAGES.body })
                        }
                        setShowErrorPopup(
                            {
                                show: !!res,
                                message: res.message || res,
                                tryAgain: res.code !== 'LimitExceededException' && !!res.code
                            }
                        );
                        setIsLoading(false);
                    })
                    .catch((err) => {
                        setShowErrorPopup({ show: true, message: err.message, tryAgain: true });
                        setIsLoading(false);
                    });
            }).catch((err) => {
                setShowErrorPopup({ show: true, message: err.message, tryAgain: true });
                setIsLoading(false);
            });
    }

    return (
        <div id='change-password-form'>
            <Form className='changePassword' onSubmit={submitPassChange}>
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
                <Form.Group className='input-group'>
                    {!isLoading &&
                        <Button
                            variant='primary'
                            type='submit'
                        >
                            <i className='fas fa-user-plus' /> Confirm
                        </Button>}
                </Form.Group>
                <Form.Group>
                    {!isLoading &&
                        <Button
                            variant='secondary'
                            type='button'
                            onClick={() => forceReload('/profile')}
                        >
                            <i className='fas fa-sign-in-alt fa-flip-horizontal' /> Cancel
                        </Button>
                    }
                    {isLoading &&
                        <Button variant='primary'>
                            Submitting... &nbsp;
                            <i className='fas fa-spinner fa-pulse'></i>
                        </Button>
                    }
                </Form.Group>
            </Form>
        </div>
    );
});
export default ChangePasswordForm;