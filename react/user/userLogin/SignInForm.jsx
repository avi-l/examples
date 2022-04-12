import { federatedSignIn, sendResetCode, signIn } from '../userManagement';
import { forceReload } from '../../../utilities/forceReload';
import React, { useState, useContext } from 'react';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

const SignInForm = observer((props) => {
    const [isLoading, setIsLoading] = useState(false);
    const { contribData } = props;
    const store = useContext(storeContext);
    const { loginStore, userStore } = store;
    const { setEmail, username, setUsername, password, setPassword,
        setIsPassResetForm, setIsSignInForm, resetSignIn,
        setIsSendPassResetCodeForm, setIsVerifyContributorForm
    } = loginStore;
    const { setUserObject } = userStore;

    const submitSignIn = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        try {
            let user = await signIn(username, password)
            if (user) {
                setUserObject(user)
                if (user.challengeName === 'NEW_PASSWORD_REQUIRED') {
                    toast.warning(`A password change is required`, { position: 'top-center' })
                    setIsPassResetForm(true);
                    setIsSignInForm(false);
                    setIsLoading(false);
                }
                else if (user.code === 'UserNotFoundException') {
                    toast.error(user.message, { position: 'top-center' })
                    setIsLoading(false);
                }
                else if (user.code === 'NotAuthorizedException') {
                    toast.error(user.message, { position: 'top-center' })
                    setIsLoading(false);
                }
                else if (user.code === 'PasswordResetRequiredException') {
                    // const currentUser = // figure out how to get CognitoUser object
                    //  setUserObject(currentUser)
                    toast.warning(user.message, { position: 'top-center' })
                    setPassword('');
                    setIsSignInForm(false);
                    setIsLoading(false);
                    sendResetCode(username)
                        .then((res) => {
                            if (res.CodeDeliveryDetails?.Destination) {
                                setEmail(res.CodeDeliveryDetails.Destination);
                                setIsSendPassResetCodeForm(false);
                                setIsPassResetForm(true);
                                setIsSignInForm(false);
                            }
                            else toast.error(res.message, { position: 'top-center' })
                        })
                        .catch((err) => {
                            toast.error(err.message, { position: 'top-center' })
                        })
                }
                else {
                    if (contribData.contributorCode) {
                        resetSignIn()
                        setIsLoading(false);
                        setIsVerifyContributorForm(true)
                    }
                    else return forceReload('/');
                }
            }
        } catch (err) {
            toast.error(err.message, { position: 'top-center' })
            setIsLoading(false);
        };
    };

    return (
        <Form className='login-form-signin' onSubmit={submitSignIn}>
            <Form.Group>
                <Form.Label>Username</Form.Label>
                <Form.Control
                    type='username'
                    id='inputUsername'
                    className='login-input'
                    placeholder='Username'
                    value={username}
                    disabled={isLoading}
                    onChange={(e) =>
                        setUsername(e.target.value)}
                    required
                    autoFocus
                />
                <Form.Label>Password</Form.Label>
                <Form.Control
                    type='password'
                    id='inputPassword'
                    className='login-input'
                    placeholder='Password'
                    value={password}
                    disabled={isLoading}
                    onChange={(e) =>
                        setPassword(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group className='login-input-group'>
                <Button block
                    className='login-btn signin-btn'
                    type='submit'
                    disabled={!username || !password || isLoading}
                >
                    {isLoading
                        ? <> Signing in... {'   '} <i className='fas fa-spinner fa-pulse'></i> </>
                        : <><i className='fas fa-sign-in-alt' /> Sign in</>
                    }
                </Button>
            </Form.Group>
            {!isLoading && <>
                <Form.Group className='login-input-group'>
                    <Form.Row >
                        <Col>
                            <Form.Label>
                                - Or sign in with -
                            </Form.Label>
                        </Col>
                    </Form.Row>
                    <Form.Row>
                        <Col>
                            <i className='fab fa-facebook-f login-social-button' title='Sign in with Facebook'
                                onClick={() => { setIsLoading(true); federatedSignIn('Facebook', contribData); }} />
                            <i className='fab fa-google login-social-button' title='Sign in with Google'
                                onClick={() => { setIsLoading(true); federatedSignIn('Google', contribData); }} />
                        </Col>
                    </Form.Row>
                </Form.Group>
                <Form.Group className='login-input-group'>
                    <Form.Row>
                        <Col>
                            <Form.Label>
                                - Just want to browse? -
                            </Form.Label>
                        </Col>
                    </Form.Row>
                    <Form.Row>
                        <Col>
                            <Button block
                                className='login-stay-guest-btn'
                                type='button'
                                onClick={() => { forceReload('/') }}>
                                <i className='fas fa-home' /> Be Our Guest!
                            </Button>
                        </Col>
                    </Form.Row>
                </Form.Group></>}
        </Form>
    );
});

export default SignInForm;