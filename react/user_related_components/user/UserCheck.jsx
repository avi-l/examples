import React, { useEffect, useState, useContext } from "react";
import { isUserLoggedIn, updateCognitoUserAttributes } from "./userManagement";
import { addUser, checkEmailExists, checkUserExists, checkUserHandleExists, deactivateCode } from "./user_api"
import '../user/profile/EditProfileModal.css'
import Loading from "../shared/Loading";
import { logout } from '../user/userManagement'
import { forceReload } from "../../utilities/forceReload";
import { Button, Col, Form, Row } from "react-bootstrap";
import { isEmail, isAlphanumeric } from 'validator'
import { CountryDropdown } from 'react-country-region-selector';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

const UserCheck = (() => {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newUserId, setNewUserId] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [newFirstName, setNewFirstName] = useState('');
    const [newLastName, setNewLastName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newUserHandle, setNewUserHandle] = useState('');
    const [userHandleToCheck, setUserHandleToCheck] = useState('');
    const [newStreet, setNewStreet] = useState('');
    const [newApt, setNewApt] = useState('');
    const [newCity, setNewCity] = useState('');
    const [newState, setNewState] = useState('');
    const [country, setCountry] = useState('');
    const [newZipcode, setNewZipcode] = useState('');
    const [newAvatar, setNewAvatar] = useState('');
    const [authProvider, setAuthProvider] = useState('');
    const [messageUserHandle, setMessageUserHandle] = useState('');
    const [cognitoUser, setCognitoUser] = useState()
    const blankAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"

    const MESSAGES = {
        // invalidEmail: `Invalid Email Format`,
        // emailTaken: `Email address already in use`,
        userHandleTaken: `${newUserHandle} is already taken.`,
        invalidUserHandle: <Form.Text style={{ color: 'red' }}>Alphanumeric only please</Form.Text>,
        userHandleBlank: <Form.Text style={{ color: 'red' }}>Username is required</Form.Text>,
        userHandleFree: <Form.Text style={{ color: 'blue' }}>Username is available!</Form.Text>,
        userHandleSuggestion: <Form.Text style={{ color: 'green' }}>Suggested Username</Form.Text>,
    }

    useEffect(() => {
        isUserLoggedIn(true)
            .then(async U => {
                setCognitoUser(U)
                const { identities } = U.attributes;
                let userHandle = U.attributes.preferred_username || U.username;
                if (userHandle.indexOf(' ') >= 0) {
                    setUserHandleToCheck(userHandle.replace(/ /g, ''))
                    setNewUserHandle(userHandle.replace(/ /g, ''))
                }
                else {
                    setUserHandleToCheck(userHandle)
                    setNewUserHandle(userHandle)
                }
                if (userHandleToCheck) {
                    await checkUserExists({ userId: U.attributes.sub, userHandle: userHandleToCheck })
                        .then(async res => {
                            if (res.data.exists) {
                                forceReload("/")
                            }
                            else {
                                setNewUserHandle(res.data.suggestion)
                                setNewUserId(U.attributes.sub)
                                setNewEmail(U.attributes.email)
                                setNewFirstName(U.attributes.given_name || "")
                                setNewLastName(U.attributes.family_name || "")
                                setNewAvatar(U.attributes.picture || blankAvatar)
                                setAuthProvider(identities
                                    ? JSON.parse(identities)
                                        .map((item) => item.providerName)[0]
                                    : 'Cognito')
                                if(userHandleToCheck === res.data.suggestion) {
                                    setMessageUserHandle(MESSAGES.userHandleFree)
                                }
                                else {
                                    setMessageUserHandle(MESSAGES.userHandleSuggestion)
                                }
                                return setIsLoading(false)
                            }
                        })
                        .catch(err => {
                            console.error(err)
                            toast.error(`ERROR: Unable to login, backend unreachable: ${err}`, { position: "top-center" })
                            logout();
                        })
                }
            })
            .catch(err => {
                console.error(err)
                logout();
            });
    }, [userHandleToCheck])

    const verifyUserHandle = (e) => {
        setNewUserHandle(e)
        if (e !== '' && !isAlphanumeric(e)) {
            return setMessageUserHandle(MESSAGES.invalidUserHandle)
        }
        if (e === '') {
            setNewUserHandle('')
            return setMessageUserHandle(MESSAGES.userHandleBlank)
        }
        setMessageUserHandle('')
    }

    const userHandleInUse = async () => {
        return await checkUserHandleExists({ userHandle: newUserHandle })
            .then((res) => {
                return res.data;
            })
            .catch(err => {
                console.error(err)
                toast.error(`ERROR: Unable to login, backend unreachable`, { position: "top-center" })
                logout();
            });
    }
    // const checkEmailInUse = async () => {
    //     return await checkEmailExists({ email: newEmail })
    //         .then((res) => { return res.data; })
    //         .catch(() => { return false; })
    // }
    const addUserToDB = async () => {
        await addUser(
            {
                userId: newUserId,
                email: newEmail,
                firstName: newFirstName,
                lastName: newLastName,
                avatar: newAvatar,
                mobilePhone: newPhone,
                userHandle: newUserHandle,
                authProvider,
            })
            .then(() => {
                forceReload("/")
            })
            .catch(err => {
                console.error(err)
                toast.error(`ERROR: Unable to login, backend unreachable`, { position: "top-center" })
                logout();
            });
    }
    const upateCognitoAndAddToDB = async (cogUserHandle) => {
        let cognitoAttributes = {
            // 'email': newEmail || user?.email,
            'family_name': newLastName || cognitoUser?.attributes?.lastName ||' ',
            'given_name': newFirstName || cognitoUser?.attributes?.firstName||' ',
            'preferred_username': newUserHandle || cogUserHandle
        }
        await updateCognitoUserAttributes(cognitoUser, cognitoAttributes)
            .then(async (res) => {
                if (res.code === 'NotAuthorizedException') {
                    return toast.error(`${res.message}`, { onClose: () => logout() })
                }
                else {
                    addUserToDB();
                }
            })
            .catch(err => {
                setIsSaving(false)
                return toast.error(`${err}`)
            })
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true)

        await userHandleInUse()
            .then(res => {
                let { exists, suggestion } = res;
                if (exists) {
                    setMessageUserHandle(MESSAGES.userHandleSuggestion)
                    toast.error(`${MESSAGES.userHandleTaken}, You could use ${suggestion} or try to choose another name`, { position: "top-center" })
                    setNewUserHandle(suggestion)
                    setIsSaving(false)
                    return false;
                }
                else {
                    // if (!isEmail(newEmail)) {
                    //     toast.error(`${MESSAGES.invalidEmail}`, { position: "top-center" })
                    //     setIsSaving(false)
                    //     return null;
                    // }
                    // if (await checkEmailInUse()) {
                    //     toast.error(`${MESSAGES.emailTaken}`, { position: "top-center" })
                    //     setIsSaving(false)
                    //     return null;
                    // }
                    const cogUserHandle = cognitoUser?.attributes?.preferred_username || cognitoUser?.username;
                    if (newUserHandle !== cogUserHandle
                        || newLastName !== cognitoUser?.attributes?.family_name
                        || newFirstName !== cognitoUser?.attributes?.given_name) {
                        upateCognitoAndAddToDB(cogUserHandle);
                    }
                    else {
                        addUserToDB();
                    }
                }
            })
            .catch(err => console.error(err))

    }
    if (isLoading) {
        return (
            <div className="user-check loading" style={{ marginTop: "200px", textAlign: "center" }}>
                <Loading />
            </div>
        );
    }
    return (
        <>
            <Form className="edit-profile-form">
                <Form.Group as={Row} className="input-group">
                    <Form.Row className="align-items-center">
                        <Col>
                            <Form.Text><h5>Please edit and save your details</h5></Form.Text>
                            <Form.Text><p>You can update these later in your profile page</p></Form.Text>
                        </Col>
                    </Form.Row>
                </Form.Group>
                <Form.Group as={Row} className="input-group">
                    <Form.Row className="align-items-center">
                        <Col xs="auto">
                            <Form.Control
                                type="text"
                                className="bg-light form-control"
                                placeholder={newUserHandle || 'Username'}
                                value={newUserHandle}
                                required
                                onChange={(e) => { verifyUserHandle(e.target.value); }} />
                        </Col>
                        {messageUserHandle}
                    </Form.Row>
                    <Form.Row className="align-items-center">
                        <Col xs="auto">
                            <Form.Control
                                type="text"
                                className="bg-light form-control"
                                placeholder={newFirstName || 'First Name'}
                                value={newFirstName}
                                onChange={(e) => setNewFirstName(e.target.value)} />
                        </Col>
                        <Col xs="auto">
                            <Form.Control
                                type="text"
                                className="bg-light form-control"
                                placeholder={newLastName || 'Last Name'}
                                value={newLastName}
                                onChange={(e) => setNewLastName(e.target.value)} />
                        </Col>
                        {/* <Col xs="auto">
                            <Form.Control
                                type="text"
                                className="bg-light form-control"
                                placeholder={newEmail || 'email@example.com'}
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)} />
                        </Col> */}
                        <Col xs="auto">
                            <Form.Control
                                type="tel"
                                className="bg-light form-control"
                                placeholder={"Phone #"}
                                value={newPhone}
                                onChange={(e) => setNewPhone(e.target.value)} />
                        </Col>
                        <Col xs="auto">
                            <Form.Control
                                type="text"
                                className="bg-light form-control"
                                placeholder={newStreet || 'Street'}
                                value={newStreet}
                                onChange={(e) => setNewStreet(e.target.value)} />
                        </Col>
                        <Col xs="auto">
                            <Form.Control
                                type="text"
                                className="bg-light form-control"
                                placeholder={newApt || 'Apt #'}
                                value={newApt}
                                onChange={(e) => setNewApt(e.target.value)} />
                        </Col>
                        <Col xs="auto">
                            <Form.Control
                                type="text"
                                className="bg-light form-control"
                                placeholder={newCity || 'City'}
                                value={newCity}
                                onChange={(e) => setNewCity(e.target.value)} />
                        </Col>
                        <Col xs="auto">
                            <Form.Control
                                type="text"
                                className="bg-light form-control"
                                placeholder={newState || 'State'}
                                value={newState}
                                onChange={(e) => setNewState(e.target.value)} />
                        </Col>
                        <Col xs="auto">
                            <Form.Control
                                type="tel"
                                className="bg-light form-control"
                                placeholder={newZipcode || 'ZIP Code'}
                                value={newZipcode || ''}
                                onChange={(e) => setNewZipcode(e.target.value)} />
                        </Col>
                        <Col xs="auto">
                            <CountryDropdown value={country} onChange={(e) => setCountry(e)} />
                        </Col>
                    </Form.Row>
                    <Form.Row>
                        <Button
                            type="button"
                            variant="primary"
                            disabled={isSaving}
                            onClick={!isSaving ? handleSubmit : null}
                        >{isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </Form.Row>
                </Form.Group>
            </Form>
        </>
    )
});

export default UserCheck;
