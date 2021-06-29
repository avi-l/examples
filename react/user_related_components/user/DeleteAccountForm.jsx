import React, { useContext, useState } from "react";
import { forceReload } from "../../utilities/forceReload";
import { observer } from "mobx-react";
import Form from 'react-bootstrap/Form';
import Button from "react-bootstrap/Button";
import storeContext from "../../stores/storeContext";
import { deleteUserInAws } from "./userManagement";
import './ChangePassword.css';
import { deactivateUser } from "./user_api";


const DeleteAccountForm = observer(() => {
    const store = useContext(storeContext);
    const { modalStore, userStore } = store;
    const {user} = userStore;
    const { setShowConfirmCancelPopup, setShowErrorPopup } = modalStore;
    const [isLoading, setIsloading] = useState(false);

    const MESSAGES = {
        confirm: `Are you sure you wish to delete your account?`,
        success: `Your account has been deleted. We hope you sign up again soon!`,
        failure: `There was an issue with deleting your account. Please try again`
    }

    const deleteAccount = async () => {
        setIsloading(true);
        await deactivateUser({
            userId: user.userId,
            active: false,
        })
        .then(async (res) => {
            await deleteUserInAws(true)
            .then((res) => {
                setShowErrorPopup({ show: true, message: res || MESSAGES.success });
                localStorage.clear();
                setIsloading(false)
            }).catch((err) => {
                setShowErrorPopup({ show: true, message: err || MESSAGES.failure, tryAgain: true });
                setIsloading(false)
            });
            setIsloading(false)
        }).catch((err) => {
            setShowErrorPopup({ show: true, message: err || MESSAGES.failure, tryAgain: true });
            setIsloading(false)
        });
    }

    return (
       
        <div id="delete-account-form">
            <Form className="DeleteAccount">
                <Form.Group className="input-group">
                    {!isLoading &&
                        <Button
                            className="btn form-control submit"
                            type="button"
                            id="btn-signup"
                            onClick={() => setShowConfirmCancelPopup({ show: true, message: MESSAGES.confirm, action: deleteAccount })}
                        >
                            <i className="fas fa-user-times" /> Delete Account?
                </Button>}
                </Form.Group>
                <Form.Group>
                    {!isLoading &&
                        <Button
                            className="btn form-control submit"
                            type="button"
                            id="btn-signup"
                            onClick={() => forceReload("/")}
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
                            <i className="fas fa-spinner fa-pulse" /> Deleting Account... &nbsp;
                    </Button>
                    }
                </Form.Group>
            </Form>
        </div>
    );
});
export default DeleteAccountForm;