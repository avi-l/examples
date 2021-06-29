import React, { useContext } from "react";
import { useHistory } from "react-router-dom";
import { isUserLoggedIn } from "./userManagement";
import { addUser, deactivateCode } from "./user_api"
import storeContext from "../../stores/storeContext";
import { observer } from "mobx-react";

const UserCheck = observer(() => {
    const history = useHistory();

    isUserLoggedIn(true).then(async U => {
        const { identities } = U.attributes;
        if (U.attributes?.sub) {
            await addUser(
                {
                    userId: U.attributes.sub,
                    email: U.attributes.email,
                    userHandle: U.attributes?.preferred_username || U.username,
                    contributorCode: U.attributes['custom:contributorCode'],
                    authProvider: identities
                        ? JSON.parse(identities)
                            .map((item) => item.providerName)[0]
                        : null,
                    active: true
                });
        }
        if (U.attributes['custom:contributorCode']) {
            await deactivateCode(
                {
                    email: U.attributes.email,
                    code: U.attributes['custom:contributorCode'],
                    userId: U.attributes.sub,
                    isUsed: true,
                })
        }
        history.push("/")
    }).catch(err => console.error(err));
    history.push("/")

    return (
        <div>
        </div>
    );
});

export default UserCheck;