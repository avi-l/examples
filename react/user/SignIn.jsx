import React, { useEffect, useContext, useState, useCallback } from 'react';
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
import Loading from '../shared/Loading';
import VerifyContributorLink from './contributorLogin/VerifyContributorLink';

const SignIn = observer(() => {
  const [isLoading, setIsLoading] = useState(true)
  const store = useContext(storeContext);
  const { loginStore } = store;
  const { isSignInForm, setIsSignInForm, isSignUpForm, setIsSignUpForm, resetSignIn,
    isVerifyCodeForm, isSendPassResetCodeForm, isForgotPassForm, isPassResetForm,
    setIsSendPassResetCodeForm, isVerifyContributorForm, setIsVerifyContributorForm
  } = loginStore;
  const params = new URL(document.location).searchParams;
  const contribData = {
    contributorEmail: params.get('contributorEmail'),
    contributorCode: params.get('contributorCode')
  }
  const { contributorCode } = contribData;

  useEffect(() => {
    (async () => {
      let user = await isUserLoggedIn(false)
      if (!user.attributes?.sub) {
        setIsLoading(false)
        return
      }
      if (contributorCode) {
        setIsLoading(false)
        resetSignIn();
        setIsVerifyContributorForm(true)
        return null
      }
      return forceReload('/')
    })()
  }, [contributorCode, resetSignIn, setIsVerifyContributorForm]);

  if (isLoading) {
    return (
      <div style={{ position: 'relative', marginTop: '150px', marginLeft: '50%', marginRight: '-50%' }}>
        <Loading />
      </div>
    )
  }
  return (
    <div className='login-body'>
      <Card className='mx-auto login-card'>
        <Card.Header className='mx-auto login-card-header'>
          <Card.Title className=' login-card-title'>
            <i className='far fa-lightbulb' /> REPLACE_HOSTNAME.Social
          </Card.Title>
          <Nav justify variant='tabs' className='login-nav-tabs' defaultActiveKey='#signin'>
            {isVerifyContributorForm ?
              <Nav.Item>
                <Nav.Link className='login-nav-tabs' eventKey='#verify' title='Verify Invite'>
                  <i className='fas fa-user-shield' /></Nav.Link>
              </Nav.Item>
              : <><Nav.Item>
                <Nav.Link className='login-nav-tabs' eventKey='#signin' title='Sign In!'
                  onClick={() => {
                    resetSignIn();
                    setIsSignInForm(true);
                  }}><i className='fas fa-sign-in-alt'></i></Nav.Link>
              </Nav.Item><Nav.Item>
                  <Nav.Link className='login-nav-tabs' eventKey='#signup' title='Sign Up!'
                    onClick={() => {
                      resetSignIn();
                      setIsSignUpForm(true);
                    }}><i className='fas fa-user-plus'></i></Nav.Link>
                </Nav.Item><Nav.Item>
                  <Nav.Link className='login-nav-tabs' eventKey='#forgotpass' title='Forgot Password?'
                    onClick={() => {
                      resetSignIn();
                      setIsSendPassResetCodeForm(true);
                    }}><i className='fas fa-key'></i>  ?</Nav.Link>
                </Nav.Item></>}
          </Nav>
        </Card.Header>
        <Card.Body className='login-card-body'>
          {isSignInForm && <SignInForm contribData={contribData} />}
          {isSignUpForm && <SignUpForm />}
          {isSendPassResetCodeForm && <SendPassResetCodeForm contribData={contribData} />}
          {isForgotPassForm && <ForgotPasswordForm contribData={contribData} />}
          {isVerifyCodeForm && <VerifyCodeForm contribData={contribData} />}
          {isVerifyContributorForm && <VerifyContributorLink contribData={contribData} />}
          {isPassResetForm && <PassResetForm contribData={contribData} />}
          <ErrorsModal />
        </Card.Body>
      </Card>
    </div>
  );
});

export default SignIn;