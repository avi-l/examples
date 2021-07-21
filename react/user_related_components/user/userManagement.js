import { awsconfig } from './cognitoCredentials';
import { Auth } from 'aws-amplify';
import { forceReload } from '../../utilities/forceReload';
import { getUser, getProfileUser } from './user_api';
import { CognitoUser } from 'amazon-cognito-identity-js';

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

export const cognitoEmailUsed = async (email) => {
    return signIn(email, '123')
        .then(res => {
            return false;
        })
        .catch(error => {
            const code = error.code;
            console.error(error);
            switch (code) {
                case 'UserNotFoundException':
                    return false;
                case 'NotAuthorizedException':
                    return true;
                case 'PasswordResetRequiredException':
                    return true;
                case 'UserNotConfirmedException':
                    return true;
                default:
                    return false;
            }
        });
}
export const setUserInStore = async (user, setUser, isBypassCache) => {
    await isUserLoggedIn(isBypassCache)
        .then(U => {
            const { identities } = U.attributes;
            !identities
                ? setUser({
                    ...user,
                    userId: U.attributes.sub,
                    userHandle: U.attributes.preferred_username || U.username,
                    isContributor: !!U.attributes['custom:contributorCode'],
                    avatar: U.attributes.picture || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
                    authProvider: 'Cognito'
                })
                :
                getUser({ userId: U.attributes.sub })
                    .then(localDbUser => {
                        if (!localDbUser.data) {
                            return false;
                        }
                        else {
                            setUser({
                                ...user,
                                userId: U.attributes.sub,
                                userHandle: localDbUser.data?.userHandle,
                                firstName: localDbUser.data?.firstName,
                                lastName: localDbUser.data?.lastName,
                                isContributor: !!U.attributes['custom:contributorCode'],
                                avatar: localDbUser.data?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
                                authProvider: localDbUser.data?.authProvider,
                            })
                            return true;
                        }
                    })
                    .catch((err) => {
                        return { error: err };
                    });
        }
        )
        .catch((err) => console.error(err));
}

export const setUserProfileData = async (user, setUser, isFullDetails) => {
    return getUser({ userId: user.userId, isFullDetails })
        .then(async localDbUser => {
            if (!localDbUser.data) {

                return false;
            }
            else {
                setUser({
                    ...user,
                    userHandle: localDbUser.data?.userHandle,
                    authProvider: localDbUser.data?.authProvider,
                    email: localDbUser.data?.email,
                    firstName: localDbUser.data?.firstName,
                    lastName: localDbUser.data?.lastName,
                    mobilePhone: localDbUser.data?.mobilePhone,
                    avatar: localDbUser.data?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png",
                    followers: localDbUser.data?.followers,
                    following: localDbUser.data?.following,
                    address: {
                        address1: localDbUser.data?.address1,
                        address2: localDbUser.data?.address2,
                        city: localDbUser.data?.city,
                        state: localDbUser.data?.state,
                        zip: localDbUser.data?.zip,
                        country: localDbUser.data?.country,
                    }
                })
                return true;
            }
        })
        .catch((err) => {
            return { error: err };
        });
}

export const updateCognitoUserAttributes = async (user, attributes) => {
    return await Auth.updateUserAttributes(user, {
        ...attributes.contributorCode
            ? { 'custom:contributorCode': attributes.contributorCode }
            : {
                // 'email': attributes.email,
                'family_name': attributes.family_name,
                'given_name': attributes.given_name,
                'preferred_username': attributes.preferred_username
            }
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
            localStorage.clear();
            forceReload('/');
        })
        .catch(err => {
            localStorage.clear();
            forceReload('/');
            return err;
        });
}
