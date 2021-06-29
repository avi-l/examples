import React, { useState, useContext } from "react";
import { isAlphanumeric } from "validator";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import { observer } from "mobx-react";
import { forceReload } from "../../../utilities/forceReload";
import storeContext from "../../../stores/storeContext";
import { checkEmailExists, checkInvite } from "../user_api";
import { signUp } from "../userManagement";
import PasswordChecklist from "react-password-checklist"

const SignUpForm = observer(() => {
    const store = useContext(storeContext);
    const { modalStore, loginStore } = store;
    const { setShowErrorPopup } = modalStore;
    const { setIsSignUpForm, setIsVerifyCodeForm,
        email, setEmail,
        password, setPassword,
        passwordCopy, setPasswordCopy,
        username, setUsername,
        phoneNumber, setPhoneNumber
    } = loginStore;

    const [isLoading, setIsLoading] = useState(false);
    const MESSAGES = {
        emailTaken: `The email ${email} is already in use`,
        invalidUsername: `${username} contains invalid characters. Please only use alpha-numeric characters`,
    };

    const checkEmailInUse = async () => {
        return await checkInvite({ email })
            .then((res) => {
                return res.data;
            })
            .catch(() => {
                return false;
            })
            || await checkEmailExists({ email })
                .then((res) => {
                    return res.data;
                })
                .catch(() => {
                    return false;
                })
    }

    const submitUserSignUp = async (event) => {
        event.preventDefault();
        setIsLoading(true);

        if (!isAlphanumeric(username)) {
            setShowErrorPopup({ show: true, message: MESSAGES.invalidUsername, tryAgain: true });
            setIsLoading(false);
        }
        else {
            const isEmailUsed = await checkEmailInUse()
            setShowErrorPopup({ show: isEmailUsed, message: MESSAGES.emailTaken, tryAgain: true });
            setIsLoading(false);

            if (!isEmailUsed) {
                setIsLoading(true);
                await signUp(
                    username,
                    password,
                    email,
                    phoneNumber,
                )
                    .then((res) => {
                        if (res.username === username) {
                            setIsVerifyCodeForm(true);
                            setIsSignUpForm(false);
                            setIsLoading(false);
                        }
                        else {
                            setShowErrorPopup(
                                {
                                    show: !!res.code,
                                    message: res.message,
                                    tryAgain: res.code === "LimitExceededException" ? false : true
                                }
                            );
                            setIsLoading(false);
                            return;
                        }
                    })
                    .catch((err) => {
                        setShowErrorPopup({ show: true, message: err.message, tryAgain: true });
                        setIsLoading(false);
                        return;
                    });
            }
            else return;
        }


    }

    return (
        <Form className="form-signin" onSubmit={submitUserSignUp}>
            <h3 className="form-signin">
                Please sign up below to create an account with us:
            </h3>
            <Form.Group className="input-group">
                <Form.Control
                    type="username"
                    id="inputEmail"
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
                    type="email"
                    id="email"
                    className="form-control"
                    placeholder="Email"
                    onChange={(e) =>
                        setEmail(e.target.value)}
                    value={email}
                    required
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
            <Form.Group className="input-group" >
                <Form.Control
                    type="password"
                    id="passwordCopy"
                    className="form-control"
                    placeholder="Confirm Password"
                    onChange={(e) =>
                        setPasswordCopy(e.target.value)}
                    value={passwordCopy}
                    required
                />
            </Form.Group>
            {password !== '' &&
                <Form.Group className="password-validator">
                    <PasswordChecklist
                        rules={["length", "specialChar", "number", "capital", "match"]}
                        minLength={8}
                        value={password}
                        valueAgain={passwordCopy}
                    />
                </Form.Group>}
            <Form.Group className="input-group">
                {!isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="submit"
                    >
                        <i className="fas fa-user-plus" /> Sign Up!
                </Button>}
            </Form.Group>
            <Form.Group>
                {!isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="button"
                        id="btn-signup"
                        onClick={() => forceReload("/signIn")}
                    >
                        <i className="fas fa-sign-in-alt fa-flip-horizontal" /> Back to Sign
                In
                </Button>
                }
                {isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="button"
                        id="btn-signup"
                    >
                        Signing Up... &nbsp;
                <i className="fas fa-spinner fa-pulse"></i>
                    </Button>
                }
            </Form.Group>
        </Form>
    );
});
export default SignUpForm;