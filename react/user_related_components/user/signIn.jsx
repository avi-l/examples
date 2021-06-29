import React, { useEffect, useContext } from "react";
import { forceReload } from "../../utilities/forceReload";
import { isUserLoggedIn } from "./userManagement";
import SignInForm from "./userLogin/SignInForm";
import SignUpForm from "./userLogin/SignUpForm";
import SendPassResetCodeForm from "./userLogin/SendPassResetCodeForm";
import ForgotPasswordForm from "./userLogin/ForgotPasswordForm";
import VerifyCodeForm from "./shared/VerifyCodeForm";
import PassResetForm from "./userLogin/PassResetForm";
import ErrorsModal from './shared/ErrorsModal';
import storeContext from "../../stores/storeContext";
import { observer } from "mobx-react";

const SignIn = observer(() => {
  const store = useContext(storeContext);
  const { loginStore } = store;
  const {
    isSignInForm,
    isSignUpForm,
    isSendPassResetCodeForm,
    isForgotPassForm,
    isVerifyCodeForm,
    isPassResetForm
  } = loginStore;

  useEffect(() => {
    isUserLoggedIn(false)
      .then(() => {
        forceReload("/");
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div id='logreg-login'>
      <div className='row no-gutters'>
        <div className='col-md-4'></div>
        {/*    <div id="logreg-forms" className="col-md-17">*/}
        {isSignInForm && <SignInForm />}
        {isSignUpForm && <SignUpForm />}
        {isSendPassResetCodeForm && <SendPassResetCodeForm />}
        {isForgotPassForm && <ForgotPasswordForm />}
        {isVerifyCodeForm && <VerifyCodeForm />}
        {isPassResetForm && <PassResetForm />}
        <ErrorsModal />
        {/*    </div>*/}
      </div>
    </div>
  );
});

export default SignIn;