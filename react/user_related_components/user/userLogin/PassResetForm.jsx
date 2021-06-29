import React, {useContext, useState} from "react";
import {newPassRequired} from "../userManagement";
import {forceReload} from "../../../utilities/forceReload";
import storeContext from "../../../stores/storeContext";
import {observer} from "mobx-react";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import PasswordChecklist from "react-password-checklist"

const PassResetForm = observer(() => {
    const store = useContext(storeContext);
    const {modalStore, loginStore, userStore} = store;
    const {
        password, setPassword,
        passwordCopy, setPasswordCopy,
    } = loginStore;
    const {userObject} = userStore;
    const { setShowErrorPopup } = modalStore;
    const [isLoading, setIsLoading] = useState(false);

    const submitNewPassRequired = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        await newPassRequired(userObject, password)
            .then((res) => {
                return forceReload("/userCheck");
            })
            .catch((err) => {
                setShowErrorPopup({ show: true, message: err.message, tryAgain: true });
                setIsLoading(false);
                return;
            });
    };

    return (
        <Form className="form-signin" onSubmit={submitNewPassRequired}>
            <h3
                className="h3 mb-3 font-weight-normal"
                style={{textAlign: "center"}}
            >
                <i className="far fa-lightbulb"/>
                FILL_IN_THE_BLANK
            </h3>
            <p> It looks like you need to change your password.</p>
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
                        // onChange={(isValid) => {}}
                        />
                    </Form.Group>}
            <Form.Group className="input-group">
                {!isLoading &&
                    <Button
                        className="btn form-control submit"
                        type="submit"
                        // disabled={!validateUserDetails()}
                    >
                        <i className="fas fa-user-plus" /> Confirm
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

export default PassResetForm;