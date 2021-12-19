import { awsconfig } from './cognitoConf';
import { Auth } from 'aws-amplify';
import { forceReload } from '../../utilities/forceReload';
import { getUser } from './user_api';
import { toast } from 'react-toastify';

Auth.configure(awsconfig);

export const signIn = async (username, password) => {
    try {
        const user = await Auth.signIn(username, password);
        return user;
    }
    catch (error) {
        return error;
    }

}
export const federatedSignIn = async (provider, contribData) => {
    try {
        await Auth.federatedSignIn({ provider: provider, customState: JSON.stringify(contribData) })
    } catch (error) {
        return error;
    }
}

export const signUp = async (username, password, email, phone_number, contributorCode) => {
    try {
        const { user } = await Auth.signUp({
            username,
            password,
            attributes: {
                email,          // optional
                phone_number,   // optional - E.164 number convention 
                'custom:contributorCode': contributorCode || '',
            }
        });
        return user;
    } catch (error) {
        return error;
    }
}

export const confirmSignUp = async (username, code) => await Auth.confirmSignUp(username, code)


// Sends confirmation code to user's email
export const sendResetCode = async (username) => {
    try {
        const res = await Auth.forgotPassword(username)
        return res;
    } catch (error) {
        return error;
    }

}
export const submitNewPassword = async (username, code, newPassword) => {
    try {
        const res = await Auth.forgotPasswordSubmit(username, code, newPassword)
        return res;
    } catch (error) {
        return error;
    }
}

export const newPassRequired = async (user, newPassword) => {
    try {
        const res = await Auth.completeNewPassword(user, newPassword)
        return res;
    } catch (error) {
        return error;
    }
}

export const isUserLoggedIn = async (isBypassCache) => {
    try {
        const res = await Auth.currentAuthenticatedUser({ bypassCache: isBypassCache })
        return res;
    } catch (error) {
        return error;
    }
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
export const setUserInStore = async (setUser, isBypassCache) => {
        const cognitoUser = await isUserLoggedIn(isBypassCache)
        if (cognitoUser.attributes?.sub) {
            const localDbUser = await getUser({ userId: cognitoUser.attributes.sub })
            if (!localDbUser.data) {
                setUser({
                    userId: cognitoUser.attributes.sub,
                })
                return { existsInDB: false };
            }
            setUser({
                userId: cognitoUser.attributes.sub,
                userHandle: localDbUser.data?.userHandle,
                firstName: localDbUser.data?.firstName,
                lastName: localDbUser.data?.lastName,
                isContributor: !!localDbUser.data?.contributorCode,
                avatar: localDbUser.data?.avatar || '/images/blank-profile-picture-973460_960_720.png',
                authProvider: localDbUser.data?.authProvider,
                unreadMsgsUserIds: localDbUser.data?.unreadMsgsUserIds,
                isAssistant: localDbUser.data?.isAssistant,
            })
            return true;
        }
}

export const setUserProfileData = async (profileUserId, setProfileUser, isFullDetails) => {
        const localDbUser = await getUser({ userId: profileUserId, isFullDetails })
        if (!localDbUser.data) {
            return false;
        }
        setProfileUser({
            userId: localDbUser.data?.userId,
            userHandle: localDbUser.data?.userHandle,
            authProvider: localDbUser.data?.authProvider,
            email: localDbUser.data?.email,
            firstName: localDbUser.data?.firstName,
            lastName: localDbUser.data?.lastName,
            mobilePhone: localDbUser.data?.mobilePhone,
            avatar: localDbUser.data?.avatar || '/images/blank-profile-picture-973460_960_720.png',
            followers: localDbUser.data?.followers,
            following: localDbUser.data?.following,
            address: {
                address1: localDbUser.data?.address1,
                address2: localDbUser.data?.address2,
                city: localDbUser.data?.city,
                state: localDbUser.data?.state,
                zip: localDbUser.data?.zip,
                country: localDbUser.data?.country,
            },
            unreadMsgsUserIds: localDbUser.data?.unreadMsgsUserIds
        })
        return true;
}

export const updateCognitoUserAttributes = async (user, attributes) => {
    try {
        if (attributes.contributorCode) {
            const res = await Auth.updateUserAttributes(user,
                { 'custom:contributorCode': attributes.contributorCode }
            )
            return res
        }
        const res = await Auth.updateUserAttributes(user,
            {
                // 'email': attributes.email,
                'family_name': attributes.family_name,
                'given_name': attributes.given_name,
                'preferred_username': attributes.preferred_username

            })
        return res;
    } catch (error) {
        return error;
    }
}
//verifyUser returns the 'sub' value from cognito, which is the userId
export const verifyUser = async () => {
    try {
        const userId = await isUserLoggedIn(true)
        return userId.attributes.sub;
    } catch (error) {
        return error;
    }
};

export const deleteUserInAws = async (isBypassCache) => {
    try {
        const user = await Auth.currentAuthenticatedUser({ bypassCache: isBypassCache })
        if (user) {
            user.deleteUser((error, data) => {
                if (error) {
                    throw error;
                }
                return data;
            })
        }
        return user;
    } catch (error) {
        return error;
    }
};

export const changeUserPass = async (userObj, oldPassword, newPassword) => {
    try {
        const res = await Auth.changePassword(userObj, oldPassword, newPassword)
        return res;
    } catch (error) {
        return error;
    }
}
export const resendVerificationEmail = async (username) => {
    try {
        const res = await Auth.resendSignUp(username)
        return res;
    } catch (error) {
        return error;
    }
}
export const onAuthError = () => {
    return toast.error(`Please sign in to use this feature`,
        {
            toastId: 'preventDuplicate',
            position: 'top-center',
            autoClose: 2500,
            onClose: () => forceReload('/signIn')
        })
}

export const logout = async () => {
    try {
        const res = await Auth.signOut({ global: true })
        localStorage.clear();
        forceReload('/signIn');
        return res;
    } catch (error) {
        localStorage.clear();
        forceReload('/signIn');
        return error
    }
}