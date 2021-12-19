import React, { useEffect, useState } from 'react';
import { isUserLoggedIn, updateCognitoUserAttributes } from './userManagement';
import { addUser, checkUserExists, checkUserHandleExists, deactivateCode, getUser } from './user_api'
import Loading from '../shared/Loading';
import { logout } from '../user/userManagement'
import { forceReload } from '../../utilities/forceReload';
import { Button, Card, Form, FormControl, InputGroup, Nav } from 'react-bootstrap';
import { isAlphanumeric } from 'validator'
import { CountryDropdown } from 'react-country-region-selector';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';
import { Hub } from 'aws-amplify';
import './UserCheck.css'
import VerifyContributorLink from './contributorLogin/VerifyContributorLink';
import ErrorsModal from './shared/ErrorsModal';
import { sendEmailToUser } from '../email/sendEmail_api';

const UserCheck = (() => {
    const params = new URL(document.location).searchParams;
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isVerifyInvite, setIsVerifyInvite] = useState(false);
    const [contribData, setContribData] = useState({ contributorCode: params.get('contributorCode') });
    const [cognitoUser, setCognitoUser] = useState()
    const [userData, setUserData] = useState({
        userId: '',
        email: '',
        firstName: '',
        lastName: '',
        mobilePhone: '',
        userHandle: '',
        address1: '',
        address2: '',
        city: '',
        state: '',
        country: '',
        newZipcode: '',
        avatar: '',
        contributorCode: '',
        authProvider: '',
        isAssistant: false,
    })
    const { firstName, lastName, mobilePhone, userHandle, address1, email,
        address2, city, state, country, newZipcode, userId, contributorCode } = userData;
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';

    const MESSAGES = {
        checkingAvailability: <Form.Text style={{ color: 'green' }}>Checking username availability...
            <i className='fas fa-circle-notch fa-spin fa-xs' style={{ color: 'green' }} /></Form.Text>,
        userHandleTaken: `${userHandle} is already taken.`,
        invalidUserHandle: <Form.Text style={{ color: 'red' }}>Alphanumeric only please</Form.Text>,
        userHandleBlank: <Form.Text style={{ color: 'red' }}>Username is required</Form.Text>,
        userHandleFree: <Form.Text style={{ color: 'blue' }}>Username is available!</Form.Text>,
        userHandleSuggestion: <Form.Text style={{ color: 'green' }}>Suggested Username</Form.Text>,
        success: 'Your details have been saved. Taking you to REPLACE_HOSTNAME.Social now!',
        emailSubject: `Welcome to REPLACE_HOSTNAME.Social!`,
        emailBody: `Hello ${userHandle}! 
          Welcome to REPLACE_HOSTNAME.Social!
          We'll put some more interesting info here soon.
          REPLACE_HOSTNAME Team`,
    }
    const [messageUserHandle, setMessageUserHandle] = useState(MESSAGES.checkingAvailability);

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
                    userHandleFree: <Form.Text style={{ color: 'blue' }}>Username is available!</Form.Text>,
                    userHandleSuggestion: <Form.Text style={{ color: 'green' }}>Suggested Username</Form.Text>
                }
                const user = await isUserLoggedIn(false)
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
                        email: user.attributes.email,
                        firstName: user.attributes.given_name || '',
                        lastName: user.attributes.family_name || '',
                        avatar: user.attributes.picture || blankAvatar,
                        contributorCode: user.attributes['custom:contributorCode'],
                        authProvider: identities
                            ? JSON.parse(identities)
                                .map((item) => item.providerName)[0]
                            : 'Cognito'
                    })
                    )
                    const res = await checkUserHandleExists({ userHandle: newUserHandle })
                    const { exists, suggestion } = res;
                    if (exists) {
                        setMessageUserHandle(MESSAGES.userHandleSuggestion)
                        toast.error(`${MESSAGES.userHandleTaken}, You could use ${suggestion} or try to choose another name`,
                            { position: 'top-center', autoClose: 2500, })
                        setUserData(prev => ({ ...prev, userHandle: suggestion }))
                        setIsSaving(false)
                        return false;
                    }
                    if (newUserHandle === suggestion) {
                        setMessageUserHandle(MESSAGES.userHandleFree)
                    }
                    else {
                        setMessageUserHandle(MESSAGES.userHandleSuggestion)
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
            return setMessageUserHandle(MESSAGES.invalidUserHandle)
        }
        if (e === '') {
            setUserData({ ...userData, userHandle: '' })
            return setMessageUserHandle(MESSAGES.userHandleBlank)
        }
        setMessageUserHandle('')
    }

    const addUserToDB = async () => {
        try {
            const res = await addUser(userData)
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
            return toast.error(`${err}`)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessageUserHandle(MESSAGES.checkingAvailability)
        setIsSaving(true)
        try {
            const res = await checkUserHandleExists({ userHandle })
            const { data: { exists, suggestion } } = res;
            if (exists) {
                setMessageUserHandle(MESSAGES.userHandleSuggestion)
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
            return toast.error(`${err}`)
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
                    <ErrorsModal />
                    {isVerifyInvite && !isLoading && <VerifyContributorLink contribData={contribData} />}
                    {isLoading && <div style={{ marginTop: 150 }}><Loading /></div>}
                    {!isVerifyInvite && !isLoading &&
                        <>
                            <Card.Text>
                                <b>Please edit and save your details</b>
                                <br />
                                <cite>You can update these later in your profile page</cite>
                            </Card.Text>
                            {messageUserHandle}
                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={userHandle || 'Username'}
                                    value={userHandle}
                                    required
                                    onChange={(e) => { verifyUserHandleFormat(e.target.value); }} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={firstName || 'First Name'}
                                    value={firstName}
                                    onChange={(e) => setUserData({ ...userData, firstName: e.target.value })} />
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={lastName || 'Last Name'}
                                    value={lastName}
                                    onChange={(e) => setUserData({ ...userData, lastName: e.target.value })} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='tel'
                                    className='bg-light form-control'
                                    placeholder={'Phone #'}
                                    value={mobilePhone}
                                    onChange={(e) => setUserData({ ...userData, mobilePhone: e.target.value })} />
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={address1 || 'Street'}
                                    value={address1}
                                    onChange={(e) => setUserData({ ...userData, address1: e.target.value })} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={address2 || 'Apt #'}
                                    value={address2}
                                    onChange={(e) => setUserData({ ...userData, address2: e.target.value })} />
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={city || 'City'}
                                    value={city}
                                    onChange={(e) => setUserData({ ...userData, city: e.target.value })} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <FormControl
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={state || 'State'}
                                    value={state}
                                    onChange={(e) => setUserData({ ...userData, state: e.target.value })} />
                                <FormControl
                                    type='tel'
                                    className='bg-light form-control'
                                    placeholder={newZipcode || 'ZIP Code'}
                                    value={newZipcode || ''}
                                    onChange={(e) => setUserData({ ...userData, newZipcode: e.target.value })} />
                            </InputGroup>
                            <InputGroup className='userCheck-input-group' size="sm">
                                <CountryDropdown value={country} onChange={(e) => setUserData({ ...userData, country: e })} />
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