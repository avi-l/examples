import { forceReload } from '../../../utilities/forceReload';
import React, { useContext, useState } from 'react';
import { signIn, submitNewPassword } from '../userManagement';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const ForgotPasswordForm = observer(() => {
    const [isLoading, setIsLoading] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const store = useContext(storeContext);
    const { loginStore } = store;
    const { username, password, setPassword,
        email, passwordCopy, setPasswordCopy } = loginStore;

    const handleSubmit = (event) => {
        event.preventDefault();
        setIsLoading(true);
        submitNewPassword(username, verifyCode, password)
            .then(() => {
                toast.success(`Password Succesfully Changed! Logging in now..`, { position: 'top-center' })
                signIn(username, password)
                    .then(() => {
                        forceReload('/');
                    })
                    .catch((err) => {
                        toast.error(err.message)
                        setIsLoading(false);
                    });
            })
            .catch((err) => {
                toast.error(err.message)
                setIsLoading(false);
            });
    };

    return (
        <Form className='form-signin' onSubmit={handleSubmit}>
            <p>
                A password reset verification code has been sent to {email}.
                In order to recover your account, please fill out details below
            </p>
            <Form.Group className='input-group'>
                <Form.Control
                    autoFocus
                    type='code'
                    id='signUpVerifyCode'
                    placeholder='Confirmation Code'
                    onChange={(e) =>
                        setVerifyCode(e.target.value)}
                    value={verifyCode}
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
            <Form.Group className='input-group'>
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
            <Form.Group className='login-input-group'>
                <Button block
                    className='submit'
                    type='submit'
                    disabled={isLoading || password === '' || password !== passwordCopy || !verifyCode}
                >
                    {isLoading
                        ? <> Submitting... &nbsp;
                            <i className='fas fa-spinner fa-pulse'></i> </>
                        : <><i className='fas fa-user-plus' /> Confirm</>
                    }
                </Button>
            </Form.Group>
        </Form>
    );
});

export default ForgotPasswordForm;