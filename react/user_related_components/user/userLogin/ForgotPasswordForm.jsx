
import { forceReload } from "../../../utilities/forceReload";
import React, { useContext, useState } from "react";
import { signIn, submitNewPassword } from "../userManagement";
import storeContext from "../../../stores/storeContext";
import { observer } from "mobx-react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import PasswordChecklist from "react-password-checklist"
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const ForgotPasswordForm = observer(() => {
    const [isLoading, setIsLoading] = useState(false);
    const [verifyCode, setVerifyCode] = useState('');
    const store = useContext(storeContext);
    const { modalStore, loginStore } = store;
    const { username, password, setPassword, email,
        passwordCopy, setPasswordCopy } = loginStore;
    const { setShowErrorPopup } = modalStore;

    const submitPasswordReset = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        await submitNewPassword(username, verifyCode, password)
            .then(async () => {
                toast.success(`Password Succesfully Changed! Logging in now..`, { position: "top-center" })
                    await signIn(username, password)
                        .then(() => {
                            forceReload("/");
                        })
                        .catch((err) => {
                            setShowErrorPopup({ show: true, message: err.message });
                            setIsLoading(false);
                        });
            })
            .catch(err => {
                setShowErrorPopup({ show: true, message: err.message, tryAgain: true });
                setIsLoading(false);
            });
    };

    return (
        <Form className="form-signin" onSubmit={submitPasswordReset}>
            <p>
                A password reset verification code has been sent to {email}.
                In order to recover your account, please fill out details below
            </p>
            <Form.Group className="input-group">
                <Form.Control
                    autoFocus
                    type="code"
                    id="signUpVerifyCode"
                    placeholder="Confirmation Code"
                    onChange={(e) =>
                        setVerifyCode(e.target.value)}
                    value={verifyCode}
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
                        disabled={!verifyCode}
                    >
                        <i className="fas fa-user-plus" /> Confirm
                </Button>}
            </Form.Group>
            <Form.Group>
                {isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="button"
                        id="btn-signup"
                    >
                        Submitting... &nbsp;
                <i className="fas fa-spinner fa-pulse"></i>
                    </Button>
                }
            </Form.Group>
        </Form>
    );
});

export default ForgotPasswordForm;
