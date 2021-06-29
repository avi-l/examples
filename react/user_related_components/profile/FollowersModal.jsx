import React, { useState, useContext, useEffect } from 'react'
import { Nav, Form, Modal, Button, Col, Row, ListGroup, Image } from 'react-bootstrap';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import './FollowersModal.css'
import Loading from '../../shared/Loading';

const FollowersModal = observer(() => {
    const [isLoading, setIsLoading] = useState(false);
    const store = useContext(storeContext);
    const { modalStore } = store;
    const { showFollowersModal, setShowFollowersModal } = modalStore;
    const { showType, user, show } = showFollowersModal;
    const blankAvatar = "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";

    // useEffect(() => {
    //     setIsLoading(true)
    //     setDisplayShowType(showType)
    //      if(displayShowType) setIsLoading(false)
    // },[showType])
    const handleClose = () => {
        setIsLoading(false)
        setShowFollowersModal({ show: false, user: '', showType: '' });
    };

    return (
        <div className="followers-modal">
            <Modal className="followers-modal"
                show={show}
                onHide={handleClose}
            >
                <Modal.Body className="followers-modal-body">
                    <Modal.Title className="followers-modal-title">
                        <Nav variant="tabs" justify defaultActiveKey={showType}>
                            <Nav.Link eventKey="followers"
                                onSelect={() => setShowFollowersModal({ show: true, user, showType: 'followers' })}
                            >Followers
                            </Nav.Link>
                            <Nav.Link eventKey="following"
                                onSelect={() => setShowFollowersModal({ show: true, user, showType: 'following' })}
                            >Following
                            </Nav.Link>
                        </Nav>
                    </Modal.Title>
                    <ListGroup variant="flush">
                        <div className="followers-modal-map followers-scrollable followers-list-group">
                            {isLoading
                                ? <div className="followers-loading"><Loading /></div>
                                : !user?.[showType]?.length
                                    ? <small>{user?.userHandle} has no {showType} yet....
                                    </small>
                                    : user?.[showType]?.map((val, key) => {
                                        return (
                                            <div key={key} className="followers-list-item">
                                                <ListGroup.Item className="followers-list-item">
                                                    <a href={val.userId !== user.userId ? "/profile/" + val?.userId : "/profile"}>
                                                        <Image roundedCircle thumbnail className="circle followers-avatar"
                                                            src={val?.avatar || blankAvatar}
                                                            alt={val?.userHandle}
                                                        />
                                                        {'  '}
                                                        <b>{val?.userHandle}</b>
                                                    </a>
                                                    {/* <div className="followers-modal-list-name">{val?.firstName}{'  '}{val?.lastName}</div> */}
                                                </ListGroup.Item>
                                               
                                            </div>
                                        )
                                    })
                            }
                        </div>
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </div>
    );
})
export default FollowersModal;