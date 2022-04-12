import { forceReload } from '../../../utilities/forceReload';
import React, { useState, useContext } from 'react';
import { confirmSignUp, signIn } from '../userManagement';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { toast } from 'react-toastify';

const VerifyCodeForm = observer((props) => {
  const [isLoading, setIsLoading] = useState(false);
  const { contribData: { contributorCode } } = props;
  const store = useContext(storeContext);
  const { loginStore } = store;
  const { username, email, password, signUpVerifyCode, setSignUpVerifyCode } = loginStore;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);
    try {
      const res = await confirmSignUp(username, signUpVerifyCode)
      if (res.code === 'CodeMismatchException') {
        toast.error(res.message);
        setIsLoading(false);
        return;
      }
      else {
        const signInResult = await signIn(username, password)
        if (signInResult) {
          const path = contributorCode ? `/userCheck?contributorCode=${contributorCode}` : '/userCheck'
          return forceReload(path);
        }
        else {
          toast.error('Unable to sign in');
          setIsLoading(false);
          return;
        }
      }
    } catch (error) {
      toast.error(`Error: ${error.message}`)
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form className='form-signin' onSubmit={handleSubmit}>
        <p>
          A verification code has been sent to <b>{email}</b>. To confirm your
          new account please enter code:
        </p>
        <Form.Group className='input-group' >
          <Form.Control
            autoFocus
            type='code'
            id='signUpVerifyCode'
            placeholder='Confirmation Code'
            onChange={(e) =>
              setSignUpVerifyCode(e.target.value)}
            value={signUpVerifyCode}
          />
        </Form.Group>
        <div className='input-group'>
          <Button
            className='btn form-control submit'
            type='submit'
            disabled={!signUpVerifyCode || isLoading}
          >
            {isLoading
              ? <>Verifying..{'  '}<i className='fas fa-spinner fa-pulse' /></>
              : <><i className='fas fa-home' />Confirm</>
            }
          </Button>
        </div>
        <hr />
        <div className='input-group'>
          {!isLoading &&
            <Button
              className='btn form-control submit'
              type='button'
              onClick={() => forceReload('/signIn')}
            >
              <i className='fas fa-sign-in-alt fa-flip-horizontal' /> Cancel
            </Button>
          }
        </div>
      </Form>
    </>
  );
});

export default VerifyCodeForm;