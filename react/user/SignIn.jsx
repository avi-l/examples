import React, { useEffect, useContext, useState } from 'react';
import { forceReload } from '../../utilities/forceReload';
import { isUserLoggedIn } from './userManagement';
import SignInForm from './userLogin/SignInForm';
import SignUpForm from './userLogin/SignUpForm';
import SendPassResetCodeForm from './userLogin/SendPassResetCodeForm';
import ForgotPasswordForm from './userLogin/ForgotPasswordForm';
import VerifyCodeForm from './shared/VerifyCodeForm';
import PassResetForm from './userLogin/PassResetForm';
import storeContext from '../../stores/storeContext';
import { observer } from 'mobx-react';
import { Card, Col, Container, Nav, Row } from 'react-bootstrap';
import './Login.css'
import VerifyContributorLink from './contributorLogin/VerifyContributorLink';
import { LoadingIcon } from '../shared/Loaders';
import PasswordChecklist from 'react-password-checklist'

const SignIn = observer(() => {
  const [isLoading, setIsLoading] = useState(true)
  const [activeKey, setActiveKey] = useState('#signin')
  const store = useContext(storeContext);
  const { loginStore } = store;
  const { isSignInForm, setIsSignInForm, isSignUpForm, setIsSignUpForm, resetSignIn,
    isVerifyCodeForm, isSendPassResetCodeForm, isForgotPassForm, isPassResetForm,
    setIsSendPassResetCodeForm, isVerifyContributorForm, setIsVerifyContributorForm,
    password, passwordCopy, isPassValid, setIsPassValid
  } = loginStore;
  const params = new URL(document.location).searchParams;
  const contribData = {
    contributorEmail: params.get('contributorEmail'),
    contributorCode: params.get('contributorCode')
  }
  const { contributorCode } = contribData;
  const bgImg = {
    backgroundImage: `url(${process.env.REACT_APP_SIGNIN_PAGE_BG_IMG})`,
  };

  useEffect(() => {
    (async () => {
      let user = await isUserLoggedIn(true)
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
        <LoadingIcon />
      </div>
    )
  }
  return (
    <div className='login-body' >
      <Container className='login-card-container'>
        <Row className='login-card-row'>
          <Col xs={5} className='login-left-col'>
            <Card className='mx-auto login-card'>
              <Card.Header className='mx-auto login-card-header'>
                <Card.Title className='login-card-title'>
                  <i className='far fa-lightbulb' /> REPLACE_HOSTNAME.Social
                </Card.Title>
                <Nav justify className='login-nav-tabs' defaultActiveKey='#signin'
                  onSelect={(selectedKey) => setActiveKey(selectedKey)}>
                  {isVerifyContributorForm ?
                    <Nav.Item>
                      <Nav.Link className={activeKey === '#signin' ? 'login-nav-tab-selected' : 'login-nav-tabs'} eventKey='#verify' title='Verify Invite'>
                        <i className='fas fa-user-shield' /></Nav.Link>
                    </Nav.Item>
                    : <><Nav.Item>
                      <Nav.Link className={activeKey === '#signin' ? 'login-nav-tab-selected' : 'login-nav-tabs'} eventKey='#signin' title='Sign In!'
                        onClick={() => {
                          resetSignIn();
                          setIsSignInForm(true);
                        }}><i className='fas fa-sign-in-alt'></i></Nav.Link>
                    </Nav.Item><Nav.Item>
                        <Nav.Link className={activeKey === '#signup' ? 'login-nav-tab-selected' : 'login-nav-tabs'} eventKey='#signup' title='Sign Up!'
                          onClick={() => {
                            resetSignIn();
                            setIsSignUpForm(true);
                          }}><i className='fas fa-user-plus'></i></Nav.Link>
                      </Nav.Item><Nav.Item>
                        <Nav.Link className={activeKey === '#forgotpass' ? 'login-nav-tab-selected' : 'login-nav-tabs'} eventKey='#forgotpass' title='Forgot Password?'
                          onClick={() => {
                            resetSignIn();
                            setIsSendPassResetCodeForm(true);
                          }}><i className='fas fa-key'></i></Nav.Link>
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
              </Card.Body>
            </Card>
          </Col>
          <Col className='login-right-col' style={bgImg}>
            {password !== '' && (isSignUpForm || isPassResetForm || isForgotPassForm) &&
              <Card className={isPassValid ? 'mx-auto login-password-validator-card-valid' : 'mx-auto login-password-validator-card'}>
                <Card.Body>
                  <PasswordChecklist
                    rules={['minLength', 'specialChar', 'number', 'capital', 'match']}
                    minLength={8}
                    iconSize={16}
                    value={password}
                    valueAgain={passwordCopy}
                    onChange={(isVal) => setIsPassValid(isVal)}
                  />
                </Card.Body>
              </Card>
            }
          </Col>
        </Row>
      </Container>
    </div>
  );
});

export default SignIn;
