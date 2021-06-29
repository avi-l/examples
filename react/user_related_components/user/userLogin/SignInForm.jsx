import { federatedSignIn, sendResetCode, signIn } from "../userManagement";
import { forceReload } from "../../../utilities/forceReload";
import React, { useState, useContext } from "react";
import storeContext from "../../../stores/storeContext";
import { observer } from "mobx-react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const SignInForm = observer(() => {
    const store = useContext(storeContext);
    const { modalStore, loginStore, userStore } = store;
    const { setShowErrorPopup } = modalStore;
    const {
        setEmail,
        username, setUsername,
        password, setPassword,
        setIsForgotPassForm,
        setIsPassResetForm,
        setIsSignInForm,
        setIsSignUpForm,
        setIsSendPassResetCodeForm
    } = loginStore;
    const [isLoading, setIsLoading] = useState(false);
    const { setUserObject } = userStore;

    const submitSignIn = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        await signIn(username, password)
            .then((user) => {
                if (user.challengeName === "NEW_PASSWORD_REQUIRED") {
                    setUserObject(user);
                    setIsPassResetForm(true);
                    setIsSignInForm(false);
                    setIsLoading(false);
                } else return forceReload("/");
            })
            .catch(async (err) => {
                if (err.code === "PasswordResetRequiredException") {
                    setPassword("");
                    setIsSignInForm(false);
                    setIsLoading(false);
                    await sendResetCode(username)
                    .then((res) => {
                        if (res.CodeDeliveryDetails?.Destination) {
                            setEmail(res.CodeDeliveryDetails.Destination);
                            setIsSendPassResetCodeForm(false);
                            setIsForgotPassForm(true);
                            setIsSignInForm(false);
                        }
                        else setShowErrorPopup({ show: true, message: res.message })
                    })
                    .catch((err) => {
                        setShowErrorPopup({ show: true, message: err.message });
                    })
                }
                else {
                    setShowErrorPopup({ show: true, message: err.message, tryAgain: true });
                    setIsLoading(false);
                    return;
                }
            });
    };

    return (
        <Form className="form-signin" onSubmit={submitSignIn}>
            <h3 className="h3" style={{ textAlign: "center" }}>
                <i className="far fa-lightbulb" /> FILL_IN_THE_BLANK
            </h3>
            <Form.Group className="input-group">
                <Form.Control
                    type="username"
                    id="inputUsername"
                    className="form-control"
                    placeholder="Username"
                    value={username}
                    onChange={(e) =>
                        setUsername(e.target.value)}
                    required
                    autoFocus
                />
            </Form.Group>
            <Form.Group className="input-group">
                <Form.Control
                    type="password"
                    id="inputPassword"
                    className="form-control"
                    placeholder="Password"
                    value={password}
                    onChange={(e) =>
                        setPassword(e.target.value)}
                    required
                />
            </Form.Group>
            <Form.Group className="input-group">
                {!isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="submit"
                        disabled={!username || !password}
                    >
                        <i className="fas fa-sign-in-alt" /> Sign in
                </Button>}
                {isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="button"
                        id="btn-signup"
                    >
                        Signing In... &nbsp;
                <i className="fas fa-spinner fa-pulse"></i>
                    </Button>
                }
            </Form.Group>
            <Form.Group className="forgot-password">
                <a
                    href="#"
                    onClick={() => {
                        setIsSendPassResetCodeForm(true);
                        setIsSignInForm(false);
                    }}
                    id="forgot_pswd"
                >
                    Forgot password?
            </a>
            </Form.Group>
            <Form.Label>
                Or sign in with
            </Form.Label>
            {!isLoading &&
                <Form.Group className="rounded-social-buttons">
                    <Button
                        className="social-button facebook"
                        type="button"
                        onClick={() => { setIsLoading(true); federatedSignIn("Facebook") }}
                    >
                        <i className="fab fa-facebook-f" />
                    </Button>
                    <Button
                        className="social-button google-plus"
                        type="button"
                        onClick={() => { setIsLoading(true); federatedSignIn("Google") }}
                    >
                        <i className="fab fa-google" />
                    </Button>
                </Form.Group>}
            {!isLoading &&
                <Form.Group>
                    <Form.Label>
                        Need an account?
            </Form.Label>
                    <Button
                        className="btn form-control submit"
                        type="button"
                        id="btn-signup"
                        onClick={() => {
                            setIsSignInForm(false);
                            setIsSignUpForm(true);
                        }}
                    >
                        <i className="fas fa-user-plus" /> Sign Up!
            </Button>
                </Form.Group>}
            {!isLoading &&
                <Form.Group>
                    <Form.Label >
                        Just want to browse?
                </Form.Label>
                    <Button
                        className="btn form-control submit"
                        type="button"
                        id="btn-stay-guest"
                        onClick={() => forceReload("/")}
                    >
                        <i className="fas fa-home" /> Be Our Guest!
                </Button>
                </Form.Group>}
        </Form>
    );
});

export default SignInForm;