import React, { useState, useContext } from 'react'
import { Form, Button, InputGroup, FormControl, Card, Nav } from 'react-bootstrap';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import { updateUserDetails, checkEmailExists, checkContributorInvite, checkUserHandleExists } from '../user_api'
import { isUserLoggedIn, logout, updateCognitoUserAttributes } from '../userManagement'
import './EditProfile.css'
import { isAlphanumeric } from 'validator'
import { CountryDropdown } from 'react-country-region-selector';
import { toast } from 'react-toastify';

const EditProfile = observer((props) => {
    const { profileUser, setProfileUser } = props;
    const store = useContext(storeContext);
    const { userStore } = store;
    const { setUser } = userStore;
    const [isSaving, setIsSaving] = useState(false);
    const [warningMsg, setWarningMsg] = useState('');
    const [userResources, setUserResources] = useState({
        userId: profileUser?.userId || '',
        address1: profileUser?.userResources?.address1 || '',
        address2: profileUser?.userResources?.address2 || '',
        city: profileUser?.userResources?.city || '',
        state: profileUser?.userResources?.state || '',
        country: profileUser?.userResources?.country || '',
        zip: profileUser?.userResources?.zip || '',
        mobilePhone: profileUser?.userResources?.mobilePhone || '',
    })
    const [userData, setUserData] = useState({
        userId: profileUser?.userId || '',
        firstName: profileUser?.firstName || '',
        lastName: profileUser?.lastName || '',
        userHandle: profileUser?.userHandle,
        avatar: profileUser?.avatar
    })

    const { firstName, lastName, userHandle, userId } = userData;
        const {  mobilePhone, address1, address2, city, state, country, zip} = userResources;

    const MESSAGES = {
        // invalidEmail: 'Invalid Email Format',
        invalidUserHandle: 'Username must be letters and/or numbers only please',
        // emailTaken: 'Email address already in use',
        userHandleTaken: 'That username is already taken. This one is free: ',
        userHandleBlank: 'Username is required',
    }

    const toastOptions = {
        position: 'top-center',
        autoClose: 1500,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: () => window.location.reload(false)
    }

    const verifyUserHandleFormat = (e) => {
        setUserData({ ...userData, userHandle: e })
        if (e !== '' && !isAlphanumeric(e)) {
            return setWarningMsg(MESSAGES.invalidUserHandle)
        }
        if (e === '') {
            setUserData({ ...userData, userHandle: '' })
            return setWarningMsg(MESSAGES.userHandleBlank)
        }
        setWarningMsg('')
    }

    // const checkEmailInUse = async () => {
    //     return await checkContributorInvite({ email: newEmail })
    //         .then((res) => { return res.data; })
    //         .catch(() => { return false; })
    //         || await checkEmailExists({ email: newEmail })
    //             .then((res) => { return res.data; })
    //             .catch(() => { return false; })
    // }
    const handleOnChange = (e, func) => {
        const { name, value } = e.target
        func(prevData => ({ ...prevData, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true)
        if (userHandle && userHandle !== profileUser?.userHandle) {
            try {
                const res = await checkUserHandleExists({ userHandle })
                if (res?.data?.exists) {
                    setWarningMsg(`${MESSAGES.userHandleTaken} ${res.data.suggestion}`)
                    setIsSaving(false)
                    setUserData({ ...userData, userHandle: res.data.suggestion })
                    return null;
                }
            } catch (error) {
                setIsSaving(false)
                return toast.error(error, { position: 'top-center' });
            }
        }
        // if (newEmail && newEmail !== profileUser?.email) {
        //     if (!isEmail(newEmail)) {
        //         toast.error(`${MESSAGES.invalidEmail}`, { position: 'top-center' })
        //         setIsSaving(false)
        //         return null;
        //     }
        //     if (await checkEmailInUse()) {
        //         toast.error(`${MESSAGES.invalidEmail}`, { position: 'top-center' })
        //         setIsSaving(false)
        //         return null;
        //     }
        // }
        try {
            const cognitoUser = await isUserLoggedIn(true)
            const { identities } = cognitoUser.attributes;
            if (!identities) {
                //only social idp login will have 'identities'
                //we only want to update cognito user pool if not social idp login
                //because social logins overwrite mapped user pool attributes
                let cognitoAttributes = {
                    // 'email': newEmail || profileUser?.email,
                    'family_name': lastName || profileUser?.lastName,
                    'given_name': firstName || profileUser?.firstName,
                    'preferred_username': userHandle || profileUser?.userHandle
                }
                const cognitoUpdateRes = await updateCognitoUserAttributes(cognitoUser, cognitoAttributes)
                if (cognitoUpdateRes.code === 'NotAuthorizedException') {
                    return toast.error(cognitoUpdateRes.message, { onClose: () => logout() })
                }
            }
    
            await updateUserDetails({userId, userData, userResources})
            const newData = {...userData, userResources: userResources}
            setProfileUser(newData)
            setUser(newData)
            toast.success('Success! Profile Updated!', toastOptions)
            setIsSaving(false)
        } catch (error) {
            setIsSaving(false)
            return toast.error(`Error: ${error}`, toastOptions)
        }
    };
    return (
        <>
            <Card className='mx-auto edit-profile-card'>
                <Card.Body className='edit-profile-card-body'>
                    <Form.Text className={'warning-text'}>{warningMsg}</Form.Text>
                    <InputGroup className='edit-profile-input-group' size="sm">
                        <FormControl
                            type='text'
                            className='bg-light form-control'
                            placeholder={userHandle || 'Username'}
                            value={userHandle}
                            name='userHandle'
                            required
                            onChange={(e) => { verifyUserHandleFormat(e.target.value); }} />
                    </InputGroup>
                    <InputGroup className='edit-profile-input-group' size="sm">
                        <FormControl
                            type='text'
                            className='bg-light form-control'
                            placeholder={firstName || 'First Name'}
                            value={firstName}
                            name='firstName'
                            onChange={(e) => handleOnChange(e, setUserData)} />
                        <FormControl
                            type='text'
                            className='bg-light form-control'
                            placeholder={lastName || 'Last Name'}
                            value={lastName}
                            name='lastName'
                            onChange={(e) => handleOnChange(e, setUserData)} />
                    </InputGroup>
                    <InputGroup className='edit-profile-input-group' size="sm">
                        <FormControl
                            type='tel'
                            className='bg-light form-control'
                            placeholder={'Phone #'}
                            value={mobilePhone}
                            name='mobilePhone'
                            onChange={(e) => handleOnChange(e, setUserResources)} />
                        <FormControl
                            type='text'
                            className='bg-light form-control'
                            placeholder={address1 || 'Street'}
                            value={address1}
                            name='address1'
                            onChange={(e) => handleOnChange(e, setUserResources)} />
                    </InputGroup>
                    <InputGroup className='edit-profile-input-group' size="sm">
                        <FormControl
                            type='text'
                            className='bg-light form-control'
                            placeholder={address2 || 'Apt #'}
                            value={address2}
                            name='address2'
                            onChange={(e) => handleOnChange(e, setUserResources)} />
                        <FormControl
                            type='text'
                            className='bg-light form-control'
                            placeholder={city || 'City'}
                            value={city}
                            name='city'
                            onChange={(e) => handleOnChange(e, setUserResources)} />
                    </InputGroup>
                    <InputGroup className='edit-profile-input-group' size="sm">
                        <FormControl
                            type='text'
                            className='bg-light form-control'
                            placeholder={state || 'State'}
                            value={state}
                            name='state'
                            onChange={(e) => handleOnChange(e, setUserResources)} />
                        <FormControl
                            type='tel'
                            className='bg-light form-control'
                            placeholder={zip || 'ZIP Code'}
                            value={zip || ''}
                            name='zip'
                            onChange={(e) => handleOnChange(e, setUserResources)} />
                    </InputGroup>
                    <InputGroup className='edit-profile-input-group' size="sm">
                        <CountryDropdown value={country} onChange={(e) => setUserResources({ ...userResources, country: e })} />
                    </InputGroup>
                    <div className='edit-profile-btn'>
                        <Button
                            block
                            size='sm'
                            variant='outline-primary'
                            disabled={isSaving}
                            onClick={!isSaving ? handleSubmit : null}
                        >{isSaving ? 'Saving...' : 'Save'}
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </>
    )
})
export default EditProfile;