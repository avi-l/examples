import React, {useState, useContext} from 'react'
import {Form, Modal, Button, Col, Row} from 'react-bootstrap';
import storeContext from '../../../stores/storeContext';
import {observer} from 'mobx-react';
import {updateUserDetails, checkEmailExists, checkInvite, checkUserHandleExists} from '../user_api'
import {isUserLoggedIn, logout, updateCognitoUserAttributes} from '../userManagement'
import './EditProfileModal.css'
import {isAlphanumeric} from 'validator'
import {CountryDropdown} from 'react-country-region-selector';
import 'react-toastify/dist/ReactToastify.css';
import {toast} from 'react-toastify';

const EditProfileModal = observer(() => {
    const store = useContext(storeContext);
    const {modalStore, userStore} = store;
    const {showEditProfileModal, setShowEditProfileModal} = modalStore;
    const {profileUser, setProfileUser, setUser} = userStore;
    const [isLoading, setIsLoading] = useState(false);
    // const [newEmail, setNewEmail] = useState(profileUser?.email);
    const [newFirstName, setNewFirstName] = useState(profileUser?.firstName || '');
    const [newLastName, setNewLastName] = useState(profileUser?.lastName || '');
    const [newPhone, setNewPhone] = useState(profileUser?.mobilePhone || '');
    const [newUserHandle, setNewUserHandle] = useState(profileUser?.userHandle);
    const [newStreet, setNewStreet] = useState(profileUser?.address?.address1 || '');
    const [newApt, setNewApt] = useState(profileUser?.address?.address2 || '');
    const [newCity, setNewCity] = useState(profileUser?.address?.city || '');
    const [newState, setNewState] = useState(profileUser?.address?.state || '');
    const [country, setCountry] = useState(profileUser?.address?.country || '');
    const [newZipcode, setNewZipcode] = useState(profileUser?.address?.zip || '');
    const [messageUserHandle, setMessageUserHandle] = useState('');

    const MESSAGES = {
        invalidEmail: 'Invalid Email Format',
        invalidUserHandle: 'Alphanumeric only please',
        // emailTaken: 'Email address already in use',
        userHandleTaken: 'The username is already taken',
    }

    const toastOptions = {
        position: 'top-center',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        onClose: () => handleClose()
    }

    const verifyUserHandle = (e) => {
        setNewUserHandle(e)
        if (e !== '' && !isAlphanumeric(e)) {
            return setMessageUserHandle(MESSAGES.invalidUserHandle)
        }
        setMessageUserHandle('')
    }

    // const checkEmailInUse = async () => {
    //     return await checkInvite({ email: newEmail })
    //         .then((res) => { return res.data; })
    //         .catch(() => { return false; })
    //         || await checkEmailExists({ email: newEmail })
    //             .then((res) => { return res.data; })
    //             .catch(() => { return false; })
    // }

    const handleClose = () => {
        setIsLoading(false)
        setShowEditProfileModal(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true)
        if (newUserHandle && newUserHandle !== profileUser?.userHandle) {
            let res = await checkUserHandleExists({userHandle: newUserHandle})
            try {
                if (res?.data?.exists) {
                    toast.error(`${MESSAGES.userHandleTaken}`, {position: 'top-center'})
                    setIsLoading(false)
                    return null;
                }
            } catch (error) {
                return toast.error(`${error}`, {position: 'top-center'});
            }
        }
        // if (newEmail && newEmail !== profileUser?.email) {
        //     if (!isEmail(newEmail)) {
        //         toast.error(`${MESSAGES.invalidEmail}`, { position: 'top-center' })
        //         setIsLoading(false)
        //         return null;
        //     }
        //     if (await checkEmailInUse()) {
        //         toast.error(`${MESSAGES.invalidEmail}`, { position: 'top-center' })
        //         setIsLoading(false)
        //         return null;
        //     }
        // }

        const newUserInfo = {
            ...profileUser,
            userHandle: newUserHandle || profileUser?.userHandle,
            // email: newEmail || profileUser?.email,
            firstName: newFirstName || profileUser?.firstName,
            lastName: newLastName || profileUser?.lastName,
            mobilePhone: newPhone || profileUser?.mobilePhone,
            address: {
                address1: newStreet || profileUser?.address?.address1,
                address2: newApt || profileUser?.address?.address2,
                city: newCity || profileUser?.address?.city,
                state: newState || profileUser?.address?.state,
                zip: newZipcode || profileUser?.address?.zip,
                country: country || profileUser?.address?.country,
            },
        }

        isUserLoggedIn(true)
            .then(cognitoUser => {
                const {identities} = cognitoUser.attributes;
                if (!identities) {
                    //only social idp login will have 'identities'
                    //we only want to update cognito user pool if not social idp login
                    //because social logins overwrite mapped user pool attributes
                    let cognitoAttributes = {
                        // 'email': newEmail || profileUser?.email,
                        'family_name': newLastName || profileUser?.lastName,
                        'given_name': newFirstName || profileUser?.firstName,
                        'preferred_username': newUserHandle || profileUser?.userHandle
                    }
                    updateCognitoUserAttributes(cognitoUser, cognitoAttributes)
                        .then((res) => {
                            if (res.code === 'NotAuthorizedException') {
                                return toast.error(`${res.message}`, {onClose: () => logout()})
                            }
                        })
                        .catch(err => {
                            setIsLoading(false)
                            return toast.error(`${err}`, toastOptions)
                        })
                }
                updateUserDetails(newUserInfo)
                    .then((res) => {
                        console.log(res.data)
                        setProfileUser({...newUserInfo})
                        setUser({...newUserInfo})
                        toast.success('Success! Profile Updated!', toastOptions)
                    })
                    .catch(err => {
                        setIsLoading(false)
                        toast.error(`${err}`, toastOptions)
                    })
            })
            .catch(err => {
                setIsLoading(false)
                return toast.error(`${err}`, {onClose: () => logout()})
            })
    };

    return (
        <Modal
            show={showEditProfileModal}
            onHide={handleClose}
        >
            <Modal.Body>
                <Modal.Title>Profile Details</Modal.Title>
                <Form className='edit-profile-form'>
                    <Form.Group as={Row} className='input-group'>
                        <Form.Row className='align-items-center'>
                            <Col xs='auto'>
                                <Form.Control
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.userHandle || 'User Handle'}
                                    value={newUserHandle}
                                    onChange={(e) => {
                                        verifyUserHandle(e.target.value);
                                    }}/>
                            </Col>
                            <Form.Text className={'blink_me'} style={{color: 'red'}}>{messageUserHandle}</Form.Text>
                        </Form.Row>
                        <Form.Row className='align-items-center'>
                            <Col xs='auto'>
                                <Form.Control
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.firstName || 'First Name'}
                                    value={newFirstName}
                                    onChange={(e) => setNewFirstName(e.target.value)}/>
                            </Col>
                            <Col xs='auto'>
                                <Form.Control
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.lastName || 'Last Name'}
                                    value={newLastName}
                                    onChange={(e) => setNewLastName(e.target.value)}/>
                            </Col>
                            {/* <Col xs='auto'>
                                <Form.Control
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.email || 'email@example.com'}
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)} />
                            </Col> */}
                            <Col xs='auto'>
                                <Form.Control
                                    type='tel'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.mobilePhone || 'Phone #'}
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}/>
                            </Col>
                            <Col xs='auto'>
                                <Form.Control
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.address?.address1 || 'Street'}
                                    value={newStreet}
                                    onChange={(e) => setNewStreet(e.target.value)}/>
                            </Col>
                            <Col xs='auto'>
                                <Form.Control
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.address?.address2 || 'Apt #'}
                                    value={newApt}
                                    onChange={(e) => setNewApt(e.target.value)}/>
                            </Col>
                            <Col xs='auto'>
                                <Form.Control
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.address?.city || 'City'}
                                    value={newCity}
                                    onChange={(e) => setNewCity(e.target.value)}/>
                            </Col>
                            <Col xs='auto'>
                                <Form.Control
                                    type='text'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.address?.state || 'State'}
                                    value={newState}
                                    onChange={(e) => setNewState(e.target.value)}/>
                            </Col>
                            <Col xs='auto'>
                                <Form.Control
                                    type='tel'
                                    className='bg-light form-control'
                                    placeholder={profileUser?.address?.zip || 'ZIP Code'}
                                    value={newZipcode || ''}
                                    onChange={(e) => setNewZipcode(e.target.value)}/>
                            </Col>
                            <Col xs='auto'>
                                <CountryDropdown value={country} onChange={(e) => setCountry(e)}/>
                            </Col>
                        </Form.Row>
                        <Modal.Footer>
                            {!isLoading && <Button variant='secondary' onClick={handleClose}>Cancel</Button>}
                            {!isLoading && <Button variant='primary' onClick={handleSubmit}>Save Changes</Button>}
                            {isLoading && <Button variant='primary'> Updating... &nbsp;
                                <i className='fas fa-spinner fa-pulse'></i>
                            </Button>}
                        </Modal.Footer>
                    </Form.Group>
                </Form>
            </Modal.Body>
        </Modal>
    );
})
export default EditProfileModal;