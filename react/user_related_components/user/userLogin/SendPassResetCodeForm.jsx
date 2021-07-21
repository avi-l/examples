import React, { useContext, useState } from "react";
import { sendResetCode } from "../userManagement";
import storeContext from "../../../stores/storeContext";
import { observer } from "mobx-react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const SendPassResetCodeForm = observer(() => {
    const [isLoading, setIsLoading] = useState(false);
    const store = useContext(storeContext);
    const { modalStore, loginStore } = store;
    const { username, setUsername, setEmail,
        setIsForgotPassForm, setIsSendPassResetCodeForm
    } = loginStore;
    const { setShowErrorPopup } = modalStore;

    const sendResetCodeToUser = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        await sendResetCode(username)
            .then((res) => {
                setIsLoading(false);
                if (!!res.CodeDeliveryDetails?.Destination) {
                    setEmail(res.CodeDeliveryDetails.Destination);
                    setIsSendPassResetCodeForm(false);
                    setIsForgotPassForm(true);
                }
                else {
                    setShowErrorPopup(
                        {
                            show: true,
                            message: 'There was a problem with your request',
                            tryAgain: true
                        });
                }
            })
            .catch((err) => {
                setShowErrorPopup({ show: true, message: err.message, tryAgain: true });
                setIsLoading(false);
            });
    }

    return (
        <Form className="form-signin" onSubmit={sendResetCodeToUser}>
            <Form.Label>
                Forgot Password? Enter your username and we will send a password reset
                code to your email
            </Form.Label>
            <Form.Group className="input-group">
                <Form.Control
                    type="code"
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
                {!isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="submit"
                        disabled={!username}
                    >
                        <i className="far fa-paper-plane" />
                             {'  '} Send Reset Code
                            </Button>
                }
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

export default SendPassResetCodeForm;
