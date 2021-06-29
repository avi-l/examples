import { forceReload } from "../../../utilities/forceReload";
import React, { useState, useContext } from "react";
import { sendResetCode } from "../userManagement";
import storeContext from "../../../stores/storeContext";
import { observer } from "mobx-react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";

const SendPassResetCodeForm = observer(() => {

    const store = useContext(storeContext);
    const { modalStore, loginStore } = store;
    const { username, setUsername, setEmail,
        setIsForgotPassForm, setIsSendPassResetCodeForm
    } = loginStore;
    const { setShowErrorPopup } = modalStore;
    const [isLoading, setIsLoading] = useState(false);

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
            <h3
                className="h3 mb-3 font-weight-normal"
                style={{ textAlign: "center" }}
            >
                <i className="far fa-lightbulb" /> FILL_IN_THE_BLANK
            </h3>
            <Form.Label>
                Forgot Password? Enter your username and we will send a password reset
                code to your email
            </Form.Label>
            <div className="input-group">
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
            </div>

            <Form.Group className="input-group">
                {!isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="submit"
                        disabled={!username}
                    >
                        <i className="fas fa-sign-in-alt " />
                                Send Reset Code
                            </Button>
                }
            </Form.Group>
            <Form.Group>
                {!isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="button"
                        id="btn-signup"
                        onClick={() => forceReload("/signIn")}
                    >
                        <i className="fas fa-sign-in-alt fa-flip-horizontal" /> Cancel
                </Button>
                }
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