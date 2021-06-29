import React from "react";
import DeleteAccountForm from "./DeleteAccountForm";
import { observer } from "mobx-react";
import ErrorsModal from "./shared/ErrorsModal";

const DeleteAccount = observer(() => {
    return (
        <div id='delete-account'>
            <DeleteAccountForm />
            <ErrorsModal />
        </div>
    );
});

export default DeleteAccount;