import React, {useState, useContext} from 'react';
import {isAlphanumeric} from 'validator';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {forceReload} from '../../../utilities/forceReload';
import {signUp} from '../userManagement';
import storeContext from '../../../stores/storeContext';
import {observer} from 'mobx-react';
import PasswordChecklist from 'react-password-checklist'

const ContributorSignUpForm = observer(() => {
    const store = useContext(storeContext);
    const {modalStore, loginStore} = store;
    const {setShowErrorPopup} = modalStore;
    const {
        setIsVerifyCodeForm,
        email,
        password, setPassword,
        passwordCopy, setPasswordCopy,
        username, setUsername,
        contributorCode,
        phoneNumber, setPhoneNumber
    } = loginStore;
    const [isLoading, setIsLoading] = useState(false);
    const MESSAGES = {
        usernameTaken: `The username ${username} is already in use. Please try a different username`,
        invalidUsername: `${username} contains invalid characters. Please only use alpha-numeric characters`,
    };

    // attempts to sign up with cognito
    const submitSignUp = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (!isAlphanumeric(username)) {
            setShowErrorPopup({show: true, message: MESSAGES.invalidUsername, tryAgain: true});
            setIsLoading(false);
        } else {
            setIsLoading(true);
            signUp(
                username,
                password,
                email,
                phoneNumber,
                contributorCode
            )
                .then((res) => {
                    if (res.username === username) {
                        setIsVerifyCodeForm(true);
                        setIsLoading(false);
                    } else if (res.code === 'UsernameExistsException') {
                        setShowErrorPopup(
                            {
                                show: true,
                                message: MESSAGES.usernameTaken,
                                tryAgain: true
                            });
                        setIsLoading(false);
                        return;
                    } else if (res.code === 'InvalidPasswordException') {
                        setShowErrorPopup({show: true, message: res.message, tryAgain: true});
                        setIsLoading(false);
                        return;
                    }
                })
                .catch((err) => {
                    setShowErrorPopup({show: true, message: err.message, tryAgain: true});
                    setIsLoading(false);
                    return;
                });
        }

    };

    return (
        <Form className='form-signin' onSubmit={submitSignUp}>
            <h3
                className='h3 mb-3 font-weight-normal'
                style={{textAlign: 'center'}}
            >
                <i className='far fa-lightbulb'/> example.com
            </h3>
            Please sign up below to create a contributor account with us:
            <Form.Group className='input-group'>
                <Form.Control
                    type='username'
                    id='inputUsername'
                    className='form-control'
                    placeholder='Username'
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)}
                    required
                    autoFocus
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
            {password !== '' &&
            <Form.Group className='password-validator'>
                <PasswordChecklist
                    rules={['length', 'specialChar', 'number', 'capital', 'match']}
                    minLength={8}
                    value={password}
                    valueAgain={passwordCopy}
                    // onChange={(isValid) => {}}
                />
            </Form.Group>}
            <Form.Group className='input-group'>
                {!isLoading &&
                <Button
                    className='btn form-control submit'
                    type='submit'
                >
                    <i className='fas fa-user-plus'/> Sign Up!
                </Button>}
            </Form.Group>
            <Form.Group>
                {!isLoading &&
                <Button
                    className='btn form-control submit'
                    type='button'
                    id='btn-signup'
                    onClick={() => forceReload('/signIn')}
                >
                    <i className='fas fa-sign-in-alt fa-flip-horizontal'/> Back to Sign
                    In
                </Button>
                }
                {isLoading &&
                <Button
                    className='btn form-control submit'
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
export default ContributorSignUpForm;
