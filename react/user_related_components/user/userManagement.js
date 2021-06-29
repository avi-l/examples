import { awsconfig } from './cognitoCredentials';
import { Auth } from 'aws-amplify';
import { forceReload } from '../../utilities/forceReload';

Auth.configure(awsconfig);

export const signIn = async (username, password) => {
    const user = await Auth.signIn(username, password);
    return user;
}

export const federatedSignIn = async (provider) => {
    try {
        await Auth.federatedSignIn({ provider: provider });
    } catch (error) {
        return error;
    }
}

export const signUp = async (username, password, email, phone_number, contributor) => {
    try {
        const { user } = await Auth.signUp({
            username,
            password,
            attributes: {
                email,          // optional
                phone_number,   // optional - E.164 number convention 
                'custom:contributorCode': contributor || '',
            }
        });
        return user;
    } catch (error) {
        return error;
    }
}

export const confirmSignUp = async (username, code) => {
    try {
        await Auth.confirmSignUp(username, code);
    } catch (error) {
        return error;
    }
}

// Sends confirmation code to user's email
export const sendResetCode = async (username) => {
    return await Auth.forgotPassword(username)
}
export const submitNewPassword = async (username, code, newPassword) => {
    return await Auth.forgotPasswordSubmit(username, code, newPassword)
}

export const newPassRequired = async (user, newPassword) => {
    return await Auth.completeNewPassword(
        user,      // the Cognito User Object
        newPassword,
    )
        .then(user => {
            // at this time the user is logged in if no MFA required
            return user;
        })
        .catch(err => {
            return err;
        });

}

export const isUserLoggedIn = async (isBypassCache) => {
    return Auth.currentAuthenticatedUser({ bypassCache: isBypassCache })
};

export const updateCognitoUserAttributes = async (user, contributorCode) => {
    return await Auth.updateUserAttributes(user, {
        'custom:contributorCode': contributorCode
    })
        .then(res => {
            return res;
        })
        .catch(err => {
            return err;
        });
}

//verifyUser returns the 'sub' value from cognito, which is the userId
export const verifyUser = async () => {
    return await isUserLoggedIn(true)
        .then(userId => {
            return userId.attributes.sub;
        })
        .catch(err => {
            return err;
        });
};

export const deleteUserInAws = async (isBypassCache) => {
    return await Auth.currentAuthenticatedUser({ bypassCache: isBypassCache })
        .then(async user => {
            user.deleteUser((error, data) => {
                if (error) {
                    throw error;
                }
                Auth.signOut({ global: true })
                return data;

            })
        }).catch(err => {
            return err;
        });
};

export const changeUserPass = async (userObj, oldPassword, newPassword) => {
    return await Auth.changePassword(
        userObj,
        oldPassword,
        newPassword
    )
        .then(res => {
            return res;
        })
        .catch(err => {
            return err;
        });
}

export const logout = async () => {
    await Auth.signOut({ global: true })
        .then(res => {
            forceReload('/');
        })
        .catch(err => {
            localStorage.clear();
            return err;
        });
}