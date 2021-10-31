/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useContext} from 'react';
import storeContext from '../../../stores/storeContext';
import {checkInvite} from '../user_api';
import {observer} from 'mobx-react';
import {isUserLoggedIn, updateCognitoUserAttributes} from '../userManagement';

const VerifyContributorLink = observer(() => {
    const store = useContext(storeContext);
    const {modalStore, loginStore} = store;
    const {showErrorPopup, setShowErrorPopup} = modalStore;
    const {
        email, setEmail,
        contributorCode, setContributorCode,
    } = loginStore;
    const EXPIRES_AFTER = 604800000; //seven days in milliseconds
    const MESSAGES = {
        invalidEmail: `We're Sorry but ${email} has not been invited to become a contributor. ` +
            `If you feel this message is in error, or would like to inquire about becoming a contributor, ` +
            `please contact our support department at: support@example.com`,
        invalidCode: `We are sorry, but ${contributorCode} does not match the ` +
            `contributor code we have on file for ${email}. If you feel this ` +
            `message is in error, please contact our support department at: support@example.com`,
        expiredCode: `We are sorry, but it appears the contributor code: ${contributorCode} ` +
            `has expired. Please check your email to see if you were sent a newer ` +
            `invitation link. If you cannot find one, contact our support department at: support@example.com`,
        alreadyContributor: `Looks like ${email} is already registered as a contributor!`,
        loggedIn: `Welcome! We see you are already logged in. Would you like us to ` +
            `upgrade your account now to become a Contributor?`,
        loggedInOtherUser: `The email address which was invited is ${email}. ` +
            `You appear to be already logged in as a different user` +
            `Please log out and try your invite link again ` +
            `to sign up for a example.com Contributor account `,
        invalidURL: `In order to become a contributor, you need a valid invitation link`,
        success: `Success! ${email} is now a Contributor`
    };
    // get email/code pair from URL    
    const params = new URL(document.location).searchParams;

    useEffect(() => {
        // throw popup if invite URL does not have proper format with email and code params.
        if (!params.get('contributorEmail') || !params.get('contributorCode'))
            setShowErrorPopup({show: true, message: MESSAGES.invalidURL});
        else {
            setEmail(params.get('contributorEmail'));
            setContributorCode(params.get('contributorCode'));
        }
    }, []);

    // determine if logged in user, if so is email same 
    // as the email address in the link
    useEffect(() => {
        //we want the email should be set from the URL link before continuing
        // this useEffect will run again if email value changes
        if (email) {
            isUserLoggedIn(false)
                .then((U) => {
                    if (U.attributes.email !== email) {
                        setShowErrorPopup({show: true, message: MESSAGES.loggedInOtherUser, signOut: true});
                    } else {
                        setShowErrorPopup({show: true, message: MESSAGES.loggedIn, isLoggedIn: true});
                        // value gets set in errors modal. 
                        // if true, we will update their cognito
                        // account with contrib code attribute
                        // useEffect will run again when this value is set in the store
                        if (showErrorPopup.makeContributor) {
                            (async () => {
                                // await updateCognitoUserAttributes(U, contributorCode)
                                await updateCognitoUserAttributes(U, {contributorCode})
                                    .then(res => {
                                        setShowErrorPopup({
                                            show: true,
                                            message: MESSAGES.success,
                                            goHomeAsContributor: true
                                        });
                                    })
                                    .catch(err => {
                                        setShowErrorPopup({show: true, message: err.message});
                                    })
                            })();
                        }
                    }
                })
                .catch((err) => console.error(err));
        }
    }, [email, showErrorPopup.makeContributor]);
    // check our contributors DB for email/code
    useEffect(() => {
        if (email && contributorCode) {
            checkInvite({email: email})
                .then((res) => {
                    //validate if contrib code used/expired/matches DB
                    if (res.data.isUsed) setShowErrorPopup({show: true, message: MESSAGES.alreadyContributor});
                    if (Date.now() > res.data.created + EXPIRES_AFTER) setShowErrorPopup({
                        show: true,
                        message: MESSAGES.expiredCode
                    });
                    if (res.data.code !== contributorCode) setShowErrorPopup({
                        show: true,
                        message: MESSAGES.invalidCode
                    });
                })
                .catch((err) => {
                    // couldn't reach DB or didn't find email in our contributors DB
                    setShowErrorPopup({
                        show: true,
                        message: (err.message === 'Network Error')
                            ? err.message
                            : MESSAGES.invalidEmail
                    });
                });
        }
    }, [email, contributorCode]);

});
export default VerifyContributorLink;