import React, { useState, useContext, useEffect } from 'react'
import { Nav, Modal, ListGroup, Image } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import storeContext from '../../../stores/storeContext';
import { observer } from 'mobx-react';
import './FollowersModal.css'
import Loading from '../../shared/Loading';
import { getFollowDetails } from '../user_api';
import { toast } from 'react-toastify';

const FollowersModal = observer(() => {
    const perPage = 8;
    const [isLoading, setIsLoading] = useState(true)
    const [displayFollow, setDisplayFollow] = useState([])
    const [lastPosition, setLastPosition] = useState(perPage);
    const [hasMore, setHasMore] = useState(true);
    const store = useContext(storeContext);
    const { modalStore } = store;
    const { showFollowersModal, setShowFollowersModal } = modalStore;
    const { showType, user, loggedInUserId, show } = showFollowersModal;
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';

    useEffect(() => {
        (async () => {
            if (user?.userId) {
                setLastPosition(perPage)
                setHasMore(true)
                try {
                    const res = await getFollowDetails({ userId: user?.userId, skip: 0, limit: perPage })
                    setDisplayFollow(res.data)
                    setIsLoading(false)
                } catch (error) {
                    setHasMore(false)
                    toast.error(error, { position: 'top-center' })
                }
            }
        })()
    }, [user])

    const getMoreFollowers = async () => {
        // let followArr = user[showType].slice(lastPosition, lastPosition + perPage)
        // if (followArr.length) {
        //     try {
        //         const res = await getFollowDetails(followArr)
        //         if (!res.data) setHasMore(false)
        //         else {
        //             setHasMore(true)
        //             setDisplayFollow(displayFollow.concat(res.data))
        //         }
        //     } catch (error) {
        //         setHasMore(false)
        //         toast.error(error, { position: 'top-center' })
        //     }
        //     finally {
        //         setLastPosition(lastPosition + perPage)
        //     }
        // }
        // else setHasMore(false)
    }

    const handleClose = () => {
        setHasMore(false)
        setDisplayFollow([])
        setShowFollowersModal({ show: false, user: '', loggedInUserId: '', showType: '' });
    };

    return (
        <div className='followers-modal'>
            <Modal className='followers-modal'
                show={show}
                onHide={handleClose}
            >
                <Modal.Body className='followers-modal-body'>
                    <Modal.Title className='followers-modal-title'>
                        <Nav variant='tabs' justify defaultActiveKey={showType}>
                            <Nav.Link eventKey='followers'
                                onSelect={() => setShowFollowersModal({ show: true, user, loggedInUserId, showType: 'followers' })}
                            >Followers
                            </Nav.Link>
                            <Nav.Link eventKey='following'
                                onSelect={() => setShowFollowersModal({ show: true, user, loggedInUserId, showType: 'following' })}
                            >Following
                            </Nav.Link>
                        </Nav>
                    </Modal.Title>
                    <ListGroup variant='flush'>
                        <div className='followers-keep-scrolling followers-modal-map followers-scrollable'>
                            {/* <InfiniteScroll
                                className='followers-keep-scrolling'
                                dataLength={displayFollow?.length||0}
                                next={getMoreFollowers}
                                hasMore={hasMore}
                                scrollableTarget='scrollableDiv'
                                loader={<div className='mini-loader'>{hasMore ? <Loading /> : <p></p>}</div>}
                            > */}
                            <div id='scrollableDiv' className='followers-modal-map followers-scrollable'>
                                {isLoading &&
                                    <div className='loading' style={{ textAlign: 'center', marginLeft: '22%', marginRight: '22%', marginTop: '10%' }}>
                                        <Loading />
                                    </div>
                                }
                                {!displayFollow[showType]?.length && !isLoading
                                    ? showType === 'followers'
                                        ? <h6 style={{ marginLeft: '22%', marginRight: '22%', marginTop: '10%' }}>{user?.userHandle} has no {showType} yet...</h6>
                                        : <h6 style={{ marginLeft: '22%', marginRight: '22%', marginTop: '10%' }}>{user?.userHandle} is not {showType} anyone yet...</h6>
                                    : displayFollow[showType]?.map((val) => {
                                        return (
                                            <div key={val.userId} className='followers-list-item'>
                                                <ListGroup.Item className='followers-list-item'>
                                                    <a href={val.userId !== loggedInUserId ? '/profile/?_id=' + val?.userId : '/profile'}>
                                                        <Image roundedCircle thumbnail className='circle followers-avatar'
                                                            src={val?.avatar || blankAvatar}
                                                            alt={val?.userHandle}
                                                        />
                                                        {'  '}
                                                        <b>{val?.userHandle}</b>
                                                    </a>
                                                </ListGroup.Item>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            {/* </InfiniteScroll> */}
                        </div>
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </div>
    );
})
export default FollowersModal;