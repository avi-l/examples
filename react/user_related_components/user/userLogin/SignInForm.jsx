import { federatedSignIn, sendResetCode, signIn } from "../userManagement";
import { forceReload } from "../../../utilities/forceReload";
import React, { useState, useContext } from "react";
import storeContext from "../../../stores/storeContext";
import { observer } from "mobx-react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { Col, Image } from "react-bootstrap";
import { toast } from "react-toastify";

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
                    toast.warning(`A password change is required`, { position: "top-center" })
                    setUserObject(user);
                    setIsPassResetForm(true);
                    setIsSignInForm(false);
                    setIsLoading(false);
                } else return forceReload("/");
            })
            .catch(async (err) => {
                if (err.code === "PasswordResetRequiredException") {
                    toast.warning(`${err.message}`, { position: "top-center" })
                    setPassword("");
                    // sendResetCodeToUser();
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
        <Form className="login-form-signin" onSubmit={submitSignIn}>
            {!isLoading &&
                <Form.Group className="login-input-group">
                    <Form.Label>Username</Form.Label>
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
                    <Form.Label>Password</Form.Label>
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
                </Form.Group>}
            <Form.Group className="login-input-group">
                {!isLoading &&
                    <Button
                        className="btn login-btn form-control submit"
                        type="submit"
                        disabled={!username || !password}
                    >
                        <i className="fas fa-sign-in-alt" /> Sign in
                    </Button>}
                {isLoading &&
                    <Button
                        className="btn login-btn  form-control submit"
                        type="button"
                        id="btn-signup"
                    >
                        Signing In... &nbsp;
                        <i className="fas fa-spinner fa-pulse"> </i>
                    </Button>
                }
            </Form.Group>
            {!isLoading &&
                <>
                    <Form.Group className="login-form-social-buttons align-items-center">
                        <Form.Row className="align-items-center">
                            <Col xs="auto">
                                <Form.Label>
                                    Or sign in with
                                </Form.Label>
                            </Col>
                        </Form.Row>
                        <Form.Row>
                            <Col xs="auto">
                                <i className="fab fa-facebook-f login-social-button"
                                    onClick={() => { setIsLoading(true); federatedSignIn("Facebook"); }} />
                                <i className="fab fa-google login-social-button"
                                    onClick={() => { setIsLoading(true); federatedSignIn("Google"); }} />
                            </Col>
                        </Form.Row>
                    </Form.Group>
                    <Form.Group>
                        <br></br>
                        <Form.Label>
                            Just want to browse?
                        </Form.Label>
                        <Button
                            className="btn login-btn form-control submit"
                            type="button"
                            id="btn-stay-guest"
                            onClick={() => { setIsLoading(true); forceReload("/") }}>
                            <i className="fas fa-home" /> Be Our Guest!
                        </Button>
                    </Form.Group></>}
        </Form>
    );
});

export default SignInForm;
