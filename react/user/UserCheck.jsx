import React, { useEffect, useState } from 'react';
import { isUserLoggedIn, updateCognitoUserAttributes } from './userManagement';
import { addUser, checkUserExists, checkUserHandleExists, deactivateCode, getUser } from './user_api'
import { logout } from '../user/userManagement'
import { forceReload } from '../../utilities/forceReload';
import { Button, Card, Form, FormControl, InputGroup, Nav } from 'react-bootstrap';
import isAlphanumeric from 'validator/lib/isAlphanumeric';
import { CountryDropdown } from 'react-country-region-selector';
import { toast } from 'react-toastify';
import { Hub } from 'aws-amplify';
import './UserCheck.css'
import VerifyContributorLink from './contributorLogin/VerifyContributorLink';
import { sendEmailToUser } from '../email/sendEmail_api';
import { LoadingIcon } from '../shared/Loaders';

const UserCheck = (() => {
    const params = new URL(document.location).searchParams;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifyInvite, setIsVerifyInvite] = useState(false);
    const [contribData, setContribData] = useState({ contributorCode: params.get('contributorCode') });
    const [cognitoUser, setCognitoUser] = useState();
    const [userResources, setUserResources] = useState({
            userId: '',
            email: '',
            mobilePhone: '',
            address1: '',
            address2: '',
            city: '',
            state: '',
            country: '',
            zip: '',
        })
    const [userData, setUserData] = useState({
            userId: '',
            firstName: '',
            lastName: '',
            userHandle: '',
            avatar: '',
            authProvider: '',
            isAssistant: false,
            isContributor: false,
            contributorCode: '',
        })
    const { firstName, lastName, userHandle, userId, contributorCode } = userData;
    const { mobilePhone, address1, email,
        address2, city, state, country, zip} = userResources;


    const MESSAGES = {
        checkingAvailability: ' Checking username availability...',
        userHandleTaken: `${userHandle} is already taken.`,
        invalidUserHandle: 'Letters and/or numbers only please',
        userHandleBlank: 'Username is required',
        userHandleFree: 'Username is available!',
        userHandleSuggestion: 'Suggested Username',
        success: 'Your details have been saved. Taking you to REPLACE_HOSTNAME.Social now!',
        emailSubject: `Welcome to REPLACE_HOSTNAME.Social!`,
        emailBody: `Hello ${userHandle}! 
          Welcome to REPLACE_HOSTNAME.Social!
          We'll put some more interesting info here soon.
          REPLACE_HOSTNAME Team`,
    }
    const [warningMsg, setWarningMsg] = useState('');

    Hub.listen('auth', async ({ payload: { event, data } }) => {
        if (event === 'customOAuthState') {
            const parseCode = JSON.parse(data)
            setUserData({ ...userData, contributorCode: parseCode.contributorCode })
            setContribData(parseCode)
        }
    })

    useEffect(() => {
        const setInitialUserData = async () => {
            try {
                const MESSAGES = {
                    userHandleFree: 'Username is available!',
                    userHandleSuggestion: 'Suggested Username'
                }
                const user = await isUserLoggedIn(true)
                console.log(user)
                if (!user.attributes?.sub) {
                    toast.error('Please log in to continue',
                        { position: 'top-center', autoClose: 2500, onClose: () => logout() });
                    return;
                }

                setCognitoUser(user)
                const { identities } = user.attributes;
                const newUserHandle = user.attributes.preferred_username || user.username;
                if (newUserHandle.indexOf(' ') >= 0) {
                    setUserData(prev => ({ ...prev, userHandle: newUserHandle.replace(/ /g, '') }))
                }
                else {
                    setUserData(prev => ({ ...prev, userHandle: newUserHandle }))
                }

                const res = await checkUserExists({ userId: user.attributes.sub })
                if (res.data.exists) {
                    try {
                        const isContributor = await getUser({ userId: user.attributes.sub })
                        if (!isContributor.data?.contributorCode && contribData?.contributorCode) {
                            setIsVerifyInvite(true)
                            setIsLoading(false)
                        }
                        else {
                            return forceReload('/')
                        }
                    } catch (error) {
                        toast.error(`ERROR: ${error}`,
                            { position: 'top-center', onClose: () => logout() });
                    }
                }
                else {
                    setUserData(prev => ({
                        ...prev,
                        userId: user.attributes.sub,
                        firstName: user.attributes.given_name || '',
                        lastName: user.attributes.family_name || '',
                        avatar: process.env.REACT_APP_BLANK_USER_AVATAR,
                        contributorCode: user.attributes['custom:contributorCode'],
                        isContributor: user.attributes['custom:contributorCode'] ? true : false,
                        authProvider: identities
                            ? JSON.parse(identities)
                                .map((item) => item.providerName)[0]
                            : 'Cognito'
                    }))
                    setUserResources(prev => ({
                        ...prev,
                        userId: user.attributes.sub,
                        email: user.attributes.email,
                    }))
                    const res = await checkUserHandleExists({ userHandle: newUserHandle })
                    const { exists, suggestion } = res;
                    if (exists) {
                        setWarningMsg(MESSAGES.userHandleSuggestion)
                        toast.error(`${MESSAGES.userHandleTaken}, You could use ${suggestion} or try to choose another name`,
                            { position: 'top-center', autoClose: 2500, })
                        setUserData(prev => ({ ...prev, userHandle: suggestion }))
                        setIsSaving(false)
                        return false;
                    }
                    if (newUserHandle === suggestion) {
                        setWarningMsg(MESSAGES.userHandleFree)
                    }
                    return setIsLoading(false)
                }
            } catch (error) {
                toast.error(`ERROR: ${error}`,
                    { position: 'top-center', onClose: () => logout() });
            }
        }
        setTimeout(() => {
            setInitialUserData();
        }, 500)
    }, [contribData?.contributorCode, userId])

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

    const addUserToDB = async () => {
        try {
            const res = await addUser({userData, userResources})
            if (contributorCode) {
                await deactivateCode(
                    {
                        code: contributorCode,
                        userId,
                        isUsed: true,
                    })
            }
            return res;
        }
        catch (error) {
            setIsSaving(false)
            toast.error(`ERROR: ${error}`,
                { position: 'top-center', onClose: () => logout() });
            return;
        }
    }
    const updateCognito = async (cogUserHandle) => {
        try {
            const cognitoAttributes = {
                'family_name': lastName || cognitoUser?.attributes?.lastName || ' ',
                'given_name': firstName || cognitoUser?.attributes?.firstName || ' ',
                'preferred_username': userHandle || cogUserHandle
            }
            const res = await updateCognitoUserAttributes(cognitoUser, cognitoAttributes)
            return res;
        } catch (err) {
            setIsSaving(false)
            return toast.error(`ERROR: ${err}`)
        }
    }
    const handleUserDetailsOnChange = (e) => {
        const { name, value } = e.target
        setUserData(prevData => ({ ...prevData, [name]: value }))
    }
    const handleUserResourceOnChange = (e) => {
        const { name, value } = e.target
        setUserResources(prevData => ({ ...prevData, [name]: value }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setWarningMsg(MESSAGES.checkingAvailability)
        setIsSaving(true)
        try {
            const res = await checkUserHandleExists({ userHandle })
            const { data: { exists, suggestion } } = res;
            if (exists) {
                setWarningMsg(MESSAGES.userHandleSuggestion)
                toast.error(`${MESSAGES.userHandleTaken}, You could use ${suggestion} or try to choose another name`,
                    { position: 'top-center', autoClose: 2500, })
                setUserData({ ...userData, userHandle: suggestion })
                setIsSaving(false)
                return false;
            }
            else {
                const cogUserHandle = cognitoUser?.attributes?.preferred_username || cognitoUser?.username;
                if (userHandle !== cogUserHandle
                    || lastName !== cognitoUser?.attributes?.family_name
                    || firstName !== cognitoUser?.attributes?.given_name) {
                    const res = await updateCognito(cogUserHandle);
                    if (res.code === 'NotAuthorizedException') {
                        return toast.error(`${res.message}`, { position: 'top-center', autoClose: 2500, onClose: () => logout() })
                    }
                }
                await addUserToDB();
                sendEmailToUser({ email, subject: MESSAGES.emailSubject, body: MESSAGES.emailBody });
                if (contribData.contributorCode) {
                    setIsVerifyInvite(true)
                    setIsLoading(false)
                }
                else {
                    setIsLoading(true)
                    toast.success(MESSAGES.success, { position: 'top-center', autoClose: 2500, onClose: () => forceReload('/') })
                }
            }
        } catch (err) {
            setIsSaving(false)
            return toast.error(`ERROR: ${err}`)
        }
    }

    return (
        <>
            <Card className='mx-auto userCheck-card'>
                <Card.Header className='mx-auto userCheck-card-header'>
                    <Card.Title className='userCheck-card-title'>
                        <i className='far fa-lightbulb' /> REPLACE_HOSTNAME.Social
                        <Nav justify variant='tabs' className='userCheck-nav-tabs' defaultActiveKey='#signin'>
                            <Nav.Item>
                                <Nav.Link className='userCheck-nav-tabs' eventKey='#verify' title='Verify Invite'>
                                    {isVerifyInvite ? <i className='fas fa-user-shield' /> : <i className='fas fa-clipboard-list'></i>}</Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Card.Title>
                </Card.Header>
                <Card.Body className='userCheck-card-body'>
                    {isVerifyInvite && !isLoading && <VerifyContributorLink contribData={contribData} />}
                    {isLoading && <div style={{ marginTop: 150 }}><LoadingIcon /></div>}
                    {!isVerifyInvite && !isLoading &&
                        <>
                            <Card.Text>
                                <b>Please edit and save your details</b>
                                <br />
                                <cite>You can update these later in your profile page</cite>
                            </Card.Text>
                            <Form.Text className={'warning-text'}>{warningMsg}</Form.Text>

                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={userHandle || 'Username'}
                                    value={userHandle}
                                    name='userHandle'
                                    required
                                    onChange={(e) => { verifyUserHandleFormat(e.target.value); }} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={firstName || 'First Name'}
                                    value={firstName}
                                    name='firstName'
                                    onChange={handleUserDetailsOnChange} />
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={lastName || 'Last Name'}
                                    value={lastName}
                                    name='lastName'
                                    onChange={handleUserDetailsOnChange} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='tel'
                                    className='bg-light form-control'
                                    placeholder={'Phone #'}
                                    value={mobilePhone}
                                    name='mobilePhone'
                                    onChange={handleUserResourceOnChange} />
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={address1 || 'Street'}
                                    value={address1}
                                    name='address1'
                                    onChange={handleUserResourceOnChange} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={address2 || 'Apt #'}
                                    value={address2}
                                    name='address2'
                                    onChange={handleUserResourceOnChange} />
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={city || 'City'}
                                    value={city}
                                    name='city'
                                    onChange={handleUserResourceOnChange} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={state || 'State'}
                                    value={state}
                                    name='state'
                                    onChange={handleUserResourceOnChange} />
                                <FormControl
                                    type='tel'
                                    className='bg-light form-control'
                                    placeholder={zip || 'ZIP Code'}
                                    value={zip || ''}
                                    name='zip'
                                    onChange={handleUserResourceOnChange} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <CountryDropdown value={country} onChange={(e) => setUserResources({ ...userResources, country: e })} />
                            </InputGroup>
                            <div className='userCheck-btn'>
                                <Button
                                    type='button'
                                    className='btn login-btn form-control submit'
                                    disabled={isSaving}
                                    onClick={!isSaving ? handleSubmit : null}
                                >{isSaving ? 'Saving...' : 'Save'}
                                </Button>
                            </div>
                        </>
                    }
                </Card.Body>
            </Card>
        </>
    )
});

export default UserCheck;