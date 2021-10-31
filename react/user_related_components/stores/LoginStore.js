import {observable, action} from 'mobx';

export class LoginStore {

    @observable
    username = '';
    @observable
    email = '';
    @observable
    password = '';
    @observable
    passwordCopy = '';
    @observable
    phoneNumber = '';
    @observable
    signUpVerifyCode = '';
    @observable
    contributorCode = '';
    @observable
    authProvider = '';

    @observable
    validations = {};

    @observable
    isSignInForm = true;
    @observable
    isSignUpForm = false;
    @observable
    isSendPassResetCodeForm = false;
    @observable
    isForgotPassForm = false;
    @observable
    isPassResetForm = false;
    @observable
    isVerifyCodeForm = false;
    @observable
    isChangePasswordForm = true;


    @action
    setUsername = name => {
        this.username = name;
    }
    @action
    setEmail = mail => {
        this.email = mail;
    }
    @action
    setPassword = pw => {
        this.password = pw;
    }
    @action
    setPasswordCopy = pw => {
        this.passwordCopy = pw;
    }
    @action
    setPhoneNumber = number => {
        this.phoneNumber = number;
    }
    @action
    setSignUpVerifyCode = string => {
        this.signUpVerifyCode = string;
    };
    @action
    setContributorCode = string => {
        this.contributorCode = string;
    };
    @action
    setAuthProvider = string => {
        this.authProvider = string;
    };
    @action
    setValidations = obj => {
        this.validations = obj;
    };

    @action
    setIsSignInForm = bool => {
        this.isSignInForm = bool;
    };
    @action
    setIsSignUpForm = bool => {
        this.isSignUpForm = bool;
    };
    @action
    setIsSendPassResetCodeForm = bool => {
        this.isSendPassResetCodeForm = bool;
    };
    @action
    setIsForgotPassForm = bool => {
        this.isForgotPassForm = bool;
    };
    @action
    setIsPassResetForm = bool => {
        this.isPassResetForm = bool;
    };
    @action
    setIsVerifyCodeForm = bool => {
        this.isVerifyCodeForm = bool
    };
    @action
    setIsChangePasswordForm = bool => {
        this.isChangePasswordForm = bool;
    };

    @action
    resetSignIn = () => {
        this.username = '';
        this.email = '';
        this.password = '';
        this.passwordCopy = '';
        this.phoneNumber = '';
        this.signUpVerifyCode = '';
        this.contributorCode ='';
        this.setAuthProvider = '';
        this.validations = {};
        this.isSignInForm = false;
        this.isSignUpForm = false;
        this.isSendPassResetCodeForm = false;
        this.isForgotPassForm = false;
        this.isPassResetForm = false;
        this.isVerifyCodeForm = false;
        this.isChangePasswordForm = false;
    };
}

const loginStore = new LoginStore();
export default loginStore;