import React, { useContext } from 'react'
import { Modal } from 'react-bootstrap';
import storeContext from '../../stores/storeContext';
import { observer } from 'mobx-react';
import './UserCardModal.css'
import UserCard from '../user/profile/UserCard';

const UserCardModal = observer(() => {
    const store = useContext(storeContext);
    const { modalStore } = store;
    const { showUserCardModal, setShowUserCardModal } = modalStore;

    const handleClose = () => setShowUserCardModal({ show: false, cardUserId: '', loggedInUserId: '' })

    return (
        <Modal className='userCardModal'
            show={showUserCardModal.show}
            onHide={handleClose}
            keyboard={false}
            centered
        >
            <Modal.Header closeButton />
            <Modal.Body >
                <div className='userCardModalBody'>
                <UserCard 
                cardUserId={showUserCardModal?.cardUserId} 
                loggedInUserId={showUserCardModal?.loggedInUserId} />
                </div>
            </Modal.Body>
        </Modal>

    );
})
export default UserCardModal;