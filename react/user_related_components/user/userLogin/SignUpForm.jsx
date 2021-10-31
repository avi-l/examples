import React, { useState, useContext } from 'react';
import { isAlphanumeric } from 'validator';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { observer } from 'mobx-react';
import { forceReload } from '../../../utilities/forceReload';
import storeContext from '../../../stores/storeContext';
import { checkEmailExists, checkInvite } from '../user_api';
import { cognitoEmailUsed, signUp } from '../userManagement';
import PasswordChecklist from 'react-password-checklist'

const SignUpForm = observer(() => {
    const store = useContext(storeContext);
    const { modalStore, loginStore } = store;
    const { setShowErrorPopup } = modalStore;
    const { setIsSignUpForm, setIsVerifyCodeForm,
        email, setEmail,
        password, setPassword,
        passwordCopy, setPasswordCopy,
        username, setUsername,
        phoneNumber, setPhoneNumber
    } = loginStore;

    const [isLoading, setIsLoading] = useState(false);
    const MESSAGES = {
        emailTaken: `The email ${email} is already in use`,
        invalidUsername: `${username} contains invalid characters. Please only use alpha-numeric characters`,
    };

    const checkEmailInUse = async () => {
        return checkInvite({ email })
            .then((res) => {
                return res.data;
            })
            .catch(() => {
                return false;
            })
            || checkEmailExists({ email })
                .then((res) => {
                    return res.data;
                })
                .catch(() => {
                    return false;
                })
            || cognitoEmailUsed(email)
                .then((res) => {
                    console.log(res)
                    return res;
                })
                .catch(() => {
                    return false;
                })
    } 

    const submitUserSignUp = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (!isAlphanumeric(username)) {
            setShowErrorPopup({ show: true, message: MESSAGES.invalidUsername, tryAgain: true });
            setIsLoading(false);
        }
        else {
            let isEmailUsed = await checkEmailInUse()
            setShowErrorPopup({ show: isEmailUsed, message: MESSAGES.emailTaken, tryAgain: true });
            setIsLoading(false);

            if (!isEmailUsed) {
                setIsLoading(true);
                signUp(
                    username,
                    password,
                    email,
                    phoneNumber,
                )
                    .then((res) => {
                        if (res.username === username) {
                            setIsVerifyCodeForm(true);
                            setIsSignUpForm(false);
                            setIsLoading(false);
                        }
                        else {
                            setShowErrorPopup(
                                {
                                    show: !!res.code,
                                    message: res.message,
                                    tryAgain: res.code === 'LimitExceededException' ? false : true
                                }
                            );
                            setIsLoading(false);
                            return;
                        }
                    })
                    .catch((err) => {
                        setShowErrorPopup({ show: true, message: err.message, tryAgain: true });
                        setIsLoading(false);
                        return;
                    });
            }
            else return;
        }


    }

    return (
        <Form className='login-form-signin' onSubmit={submitUserSignUp}>
            <Form.Group className='login-input-group'>
            <Form.Label>Username</Form.Label>
                <Form.Control
                    type='username'
                    id='inputEmail'
                    className='form-control'
                    placeholder='Username'
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)}
                    required
                    autoFocus
                />
            </Form.Group>
            <Form.Group className='login-input-group'>
            <Form.Label>Email address</Form.Label>
                <Form.Control
                    type='email'
                    id='email'
                    className='form-control'
                    placeholder='Email'
                    onChange={(e) =>
                        setEmail(e.target.value)}
                    value={email}
                    required
                />
            </Form.Group>
            <Form.Group className='login-input-group'>
            <Form.Label>Password</Form.Label>
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
            <Form.Group className='login-input-group' >
            <Form.Label>Re-enter Password</Form.Label>
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
                <Form.Group className='login-password-validator'>
                    <PasswordChecklist
                        rules={['length', 'specialChar', 'number', 'capital', 'match']}
                        minLength={8}
                        value={password}
                        valueAgain={passwordCopy}
                    // onChange={(isValid) => {}}
                    />
                </Form.Group>}
            <Form.Group className='login-input-group'>
                {!isLoading &&
                    <Button
                        className='btn login-btn form-control submit'
                        type='submit'
                    // disabled={!validateUserDetails()}
                    >
                        <i className='fas fa-user-plus' /> Create Account!
                    </Button>}
            </Form.Group>
            <Form.Group>

                {isLoading &&
                    <Button
                        className='btn login-btn form-control submit'
                        type='button'
                        id='btn-signup'
                    >
                        Signing Up... &nbsp;
                        <i className='fas fa-spinner fa-pulse'></i>
                    </Button>
                }
            </Form.Group>
        </Form>
    );
});
export default SignUpForm;