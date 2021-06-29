import React, { useContext } from "react";
import ErrorsModal from './shared/ErrorsModal';
import storeContext from "../../stores/storeContext";
import { observer } from "mobx-react";
import ChangePasswordForm from "./ChangePasswordForm";

const ChangePassword = observer(() => {
    const store = useContext(storeContext);
    const { loginStore } = store;
    const { isChangePasswordForm } = loginStore;

    return (
        <div id='change-password'>
                {isChangePasswordForm && <ChangePasswordForm />}
                <ErrorsModal />
        </div>
    );
});

export default ChangePassword;