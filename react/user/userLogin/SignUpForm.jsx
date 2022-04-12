import React, { useState, useContext } from 'react';
import isEmail from 'validator/lib/isEmail';
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { observer } from 'mobx-react';
import storeContext from '../../../stores/storeContext';
import { checkEmailExists } from '../user_api';
import { cognitoEmailUsed, signUp } from '../userManagement';
import { toast } from 'react-toastify';

const SignUpForm = observer(() => {
    const store = useContext(storeContext);
    const { loginStore } = store;
    const { setIsSignUpForm, setIsVerifyCodeForm,
        email, setEmail,
        password, setPassword,
        passwordCopy, setPasswordCopy,
        username, setUsername,
        phoneNumber, setPhoneNumber,
        isPassValid, setIsPassValid
    } = loginStore;
    const [warningMsg, setWarningMsg] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const MESSAGES = {
        emailTaken: `The email ${email} is already in use`,
        invalidUsername: 'Letters and/or numbers only please',
        invalidEmailFormat: 'Invalid Email Format',
        userHandleTaken: `Sorry, it looks like the username ${username} is already in use.`,
    };
    const verifyUserHandle = (e) => {
        setUsername(e)
        if (e !== '' && !isAlphanumeric(e)) {
            // return toast.warning(MESSAGES.invalidUserHandle, toastOptions)
            return setWarningMsg(MESSAGES.invalidUsername)
        }
        setWarningMsg('')
    }
    const verifyEmailFormat = () => {
        if (!isEmail(email)) {
            return setWarningMsg(MESSAGES.invalidEmailFormat)
        }
        setWarningMsg('')
    }
    const checkEmailInUse = async () => {
        return checkEmailExists({ email })
        .then((res) => {
            return res.data;
        })
        .catch(() => {
            return false;
        })
        || cognitoEmailUsed(email)
            .then((res) => {
                return res;
            })
            .catch(() => {
                return false;
            })
    }
    const sendSignUpToAWS = async () => {
        try {
            const res = await signUp(username, password, email, phoneNumber)
            return res;
        }
        catch (err) { return err };
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        const isEmailUsed = await checkEmailInUse()
        if (isEmailUsed) {
            toast.warning(MESSAGES.emailTaken, 
                {position: 'top-center', onClose: () => setEmail('')});
            setWarningMsg(MESSAGES.emailTaken);
            
            setIsLoading(false);
            return
        }

        const res = await sendSignUpToAWS()
        if (!res) {
            toast.error('Unable to sign up, please try again', {position: 'top-center'})
            setIsLoading(false);
            return;
        }
        if (res.code === 'UsernameExistsException') {
            toast.warning(MESSAGES.userHandleTaken, 
                {position: 'top-center', onClose: () => setUsername('')});
            setWarningMsg(MESSAGES.userHandleTaken);
            setIsLoading(false);
            return;
        }
        else if (res.code) {
            toast.error(res.message, {position: 'top-center'});
            setIsLoading(false);
            return;
        }
        setIsVerifyCodeForm(true);
        setIsSignUpForm(false);
        setIsLoading(false);
        setIsPassValid(false)
        return;
    }

    return (
        <>
        <Form className='login-form-signin' onSubmit={handleSubmit}>
            <Form.Group>
            <Form.Text className={'warning-text'}>{warningMsg}</Form.Text>
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type='username'
                    id='inputEmail'
                   className='login-input'
                    placeholder='Username'
                    value={username}
                    onChange={(e) =>
                        verifyUserHandle(e.target.value)}
                    required
                    autoFocus
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Email address</Form.Label>
                <Form.Control
                    type='email'
                    id='email'
                   className='login-input'
                    placeholder='Email'
                    onChange={(e) =>
                        setEmail(e.target.value)}
                    value={email}
                    onBlur={() => verifyEmailFormat()}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type='password'
                    id='inputPassword'
                   className='login-input'
                    placeholder='Password'
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group>
                <Form.Label>Re-enter Password</Form.Label>
                <Form.Control
                    type='password'
                    id='passwordCopy'
                   className='login-input'
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
                    id='btn-signup'
                    disabled={isLoading || !isPassValid || !username || !email}
                >
                    {isLoading
                        ? <> Signing Up... {'   '} <i className='fas fa-spinner fa-pulse'></i> </>
                        : <><i className='fas fa-user-plus' /> Create Account!</>
                    }
                </Button>
            </Form.Group>
        </Form>
        </>
    );
});
export default SignUpForm;