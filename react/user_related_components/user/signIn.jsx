import React, { useEffect, useContext } from 'react';
import { forceReload } from '../../utilities/forceReload';
import { isUserLoggedIn } from './userManagement';
import SignInForm from './userLogin/SignInForm';
import SignUpForm from './userLogin/SignUpForm';
import SendPassResetCodeForm from './userLogin/SendPassResetCodeForm';
import ForgotPasswordForm from './userLogin/ForgotPasswordForm';
import VerifyCodeForm from './shared/VerifyCodeForm';
import PassResetForm from './userLogin/PassResetForm';
import ErrorsModal from './shared/ErrorsModal';
import storeContext from '../../stores/storeContext';
import { observer } from 'mobx-react';
import { Card, Nav } from 'react-bootstrap';
import './Login.css'

const SignIn = observer(() => {
  const store = useContext(storeContext);
  const { loginStore } = store;
  const { isSignInForm, setIsSignInForm,
    isSignUpForm, setIsSignUpForm,
    isVerifyCodeForm, setIsVerifyCodeForm,
    isSendPassResetCodeForm, setIsSendPassResetCodeForm,
    isForgotPassForm, setIsForgotPassForm,
    isPassResetForm, setIsPassResetForm,
    setEmail, setUsername, setPassword, setPasswordCopy,
  } = loginStore;

  useEffect(() => {
    isUserLoggedIn(false)
      .then(() => {
        forceReload('/');
      })
      .catch((err) => console.error(err));
  }, []);

  const clearForms = () => {
    setIsSignInForm(false);
    setIsSignUpForm(false);
    setIsPassResetForm(false);
    setIsForgotPassForm(false);
    setIsVerifyCodeForm(false);
    setIsSendPassResetCodeForm(false);
    setEmail('');
    setPassword('');
    setPasswordCopy('');
    setUsername('');
  }

  return (
    <div className='login-body'>
      <Card className='mx-auto login-card'>
        <Card.Header className='mx-auto login-card-header'>
          <Card.Title className=' login-card-title'>
            <i className='far fa-lightbulb' /> example.com
          </Card.Title>
          <Nav justify variant='tabs' className='login-nav-tabs' defaultActiveKey='#signin'>
            <Nav.Item>
              <Nav.Link className='login-nav-tabs' eventKey='#signin' title='Sign In!'
                onClick={() => {
                  clearForms();
                  setIsSignInForm(true);
                }}><i className='fas fa-sign-in-alt'></i></Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className='login-nav-tabs' eventKey='#signup' title='Sign Up!'
                onClick={() => {
                  clearForms();
                  setIsSignUpForm(true);
                }}><i className='fas fa-user-plus'></i></Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link className='login-nav-tabs' eventKey='#forgotpass' title='Forgot Password?'
                onClick={() => {
                  clearForms()
                  setIsSendPassResetCodeForm(true);
                }}><i className='fas fa-key'></i>  ?</Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Header>
        <Card.Body className='login-card-body'>
          {isSignInForm && <SignInForm />}
          {isSignUpForm && <SignUpForm />}
          {isSendPassResetCodeForm && <SendPassResetCodeForm />}
          {isForgotPassForm && <ForgotPasswordForm />}
          {isVerifyCodeForm && <VerifyCodeForm />}
          {isPassResetForm && <PassResetForm />}
          <ErrorsModal />
        </Card.Body>
      </Card>
    </div>
  );
});

export default SignIn;