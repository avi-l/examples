import React, {useContext, useState} from 'react';
import Modal from 'react-bootstrap/Modal';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import storeContext from '../../stores/storeContext';
import {forceReload} from '../../utilities/forceReload';
import {userInfo} from './user_api';
import {verifyUser} from './userManagement';
import {observer} from 'mobx-react';
// import * as mobx from 'mobx';

const VerifyModals = observer(() => {
    const store = useContext(storeContext);
    const {modalStore} = store;
    const {showVerifyModal, setShowVerifyModal} = modalStore;
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    const close = () => {
        setShowVerifyModal({result: '', tries: 0, firstName: '', lastName: ''});
        forceReload('/');
    };

    const triedAgain = async () => {
        if(firstName === showVerifyModal.firstName && lastName === showVerifyModal.lastName) {
            setShowVerifyModal({...showVerifyModal, result: 'verified', tries: 0});
            const info = {mobilePhone:showVerifyModal.phone, firstName, lastName}
            await userInfo({userId: verifyUser(), info});
        }
       else setShowVerifyModal({...showVerifyModal, result: 'try again', tries: 2});
    };

    const verified = () => {
    return(
        <Modal
            size='md'
            dialogClassName='modal-verify'
            centered
            show={showVerifyModal.result === 'verified'}
            onHide={close}
        >
            <Modal.Header closeButton>
                <Modal.Title className={'centerText'}>
                    Phone verification
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{`${showVerifyModal.firstName} ${showVerifyModal.lastName}, your phone number ${showVerifyModal.phone} has been verified!`}</p>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type='button'
                    className='btn btn-primary'
                    onClick={close}
                >
                    Close
                </button>
            </Modal.Footer>
        </Modal>
    )
};

const tryAgain = () => {
    return(
        <Modal
            size='md'
            dialogClassName='modal-verify'
            centered
            show={showVerifyModal.result === 'try again' && showVerifyModal.tries === 1}
            onHide={close}
        >
            <Modal.Header>
                <Modal.Title className={'centerText'}>
                    Phone verification
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{`The phone number you entered: ${showVerifyModal.phone} is registered to
                    ${showVerifyModal.firstName.substr(0,1)}****** ${showVerifyModal.lastName.substr(0,1)}******
                    Please enter the owner's real name here:`}</p>
                <InputGroup className='mb-3'>
                    <InputGroup.Prepend>
                        <InputGroup.Text>First and last name</InputGroup.Text>
                    </InputGroup.Prepend>
                    <FormControl as={'input'}
                                 placeholder='First Name'
                                 value={firstName}
                                 onChange={e => setFirstName(e.target.value.toUpperCase())}/>
                    <FormControl as={'input'}
                                 placeholder='Last Name'
                                 value={lastName}
                                 onChange={e => setLastName(e.target.value.toUpperCase())}/>
                </InputGroup>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type='button'
                    className='btn btn-primary'
                    onClick={() => triedAgain()}
                >
                    Submit
                </button>
                <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={close}
                >
                    Maybe later
                </button>
            </Modal.Footer>
        </Modal>
    )
};
const wrongNumber = () => {
    return (
        <Modal
            size='md'
            dialogClassName='modal-verify'
            centered
            show={showVerifyModal.result === 'try again' && showVerifyModal.tries === 2}
            onHide={close}
        >
            <Modal.Header closeButton>
                <Modal.Title className={'centerText'}>
                    Phone verification error
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <p>{`Sorry, but the name you entered does not match the name of the owner of the phone. 
                Feel free to try again later.`}</p>
            </Modal.Body>
            <Modal.Footer>
                <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={close}
                >
                    Close
                </button>
            </Modal.Footer>
        </Modal>
    )
};
    return (
        <div>
            {verified()}
            {tryAgain()}
            {wrongNumber()}
        </div>
    );
});

export default VerifyModals;