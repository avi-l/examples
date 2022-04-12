import React, { useState, useEffect } from 'react'
import { Nav, Modal, ListGroup, Image } from 'react-bootstrap';
import InfiniteScroll from 'react-infinite-scroll-component';
import './FollowersModal.css'
import { toast } from 'react-toastify';
import { getFollowDetails } from '../user_api';
import { LoadingIcon } from '../../shared/Loaders';

const FollowersModal = (props) => {
    const { show, type, user, loggedInUserId, close } = props;
    const [showType, setShowType] = useState(type)
    const [isLoading, setIsLoading] = useState(true)
    const [displayFollow, setDisplayFollow] = useState([])
    const perPage = 8;
    const [lastPosition, setLastPosition] = useState(perPage);
    const [hasMore, setHasMore] = useState(false);


    const fetchFollowDetails = async () => {
        try {
            const route = showType === 'followers' ? '/follows/getFollowerDetails' : '/follows/getFollowingDetails'
            const res = await getFollowDetails(route,
                { userId: user.userId, skip: lastPosition, limit: perPage, })
            console.log(res.data)
            if (res.data.length < perPage) setHasMore(false)
            else {
                setHasMore(true)
                setDisplayFollow(displayFollow.concat(res.data.map(U => U.userDetails)))
                setLastPosition(lastPosition + perPage)
            }
        } catch (error) {
            setHasMore(false)
            toast.error(error, { position: 'top-center' })
        }
    }

    useEffect(() => {
        const fetchInitialFollowerDetails = async () => {
            setIsLoading(true)
            setHasMore(true)
            setDisplayFollow([])
            try {
                const route = showType === 'followers' ? '/follows/getFollowerDetails' : '/follows/getFollowingDetails'
                const res = await getFollowDetails(route,
                    { userId: user.userId, skip: 0, limit: 8, })
                if (res.data.length < perPage) setHasMore(false)
                setDisplayFollow(res.data.map(U => U.userDetails))
                setIsLoading(false)
            } catch (error) {
                setHasMore(false)
                toast.error(error, { position: 'top-center' })
            }
        }
        user?.userId && showType && fetchInitialFollowerDetails()
    }, [showType, user])

    const handleClose = () => {
        setHasMore(false)
        setLastPosition(0)
        setDisplayFollow([])
        close();
    };

    return (
        <div className='followers-modal' id='scrollableDiv'>
            <Modal className='followers-modal'
                size='md'
                aria-labelledby="contained-modal-title-vcenter"
                centered
                show={show}
                onHide={handleClose}
            >
                <Modal.Body className='followers-modal-body'>
                    <Modal.Title className='followers-modal-title'>
                        <Nav className='followers-modal-nav' variant='tabs' justify defaultActiveKey={showType}>
                            <Nav.Item as="li" >
                                <Nav.Link eventKey='followers'
                                    onSelect={() => setShowType('followers')}
                                >Followers
                                </Nav.Link>
                            </Nav.Item>
                            <Nav.Item as="li" >
                                <Nav.Link eventKey='following'
                                    onSelect={() => setShowType('following')}
                                >Following
                                </Nav.Link>
                            </Nav.Item>
                        </Nav>
                    </Modal.Title>
                    <ListGroup variant='flush'>
                        <div className='followers-modal-map followers-scrollable'>
                            <InfiniteScroll
                                className='followers-keep-scrolling'
                                dataLength={displayFollow?.length || 0}
                                next={fetchFollowDetails}
                                hasMore={hasMore}
                                height={450}
                                scrollableTarget='scrollableDiv'
                                loader={<div className='mini-loader'>{hasMore ? <LoadingIcon /> : <p></p>}</div>}
                            >
                                <div className='followers-modal-map followers-scrollable'>
                                    {!displayFollow?.length && !isLoading
                                        ? showType === 'followers'
                                            ? <h6 style={{ marginLeft: '22%', marginRight: '22%', marginTop: '10%' }}>{user?.userHandle} has no {showType} yet...</h6>
                                            : <h6 style={{ marginLeft: '22%', marginRight: '22%', marginTop: '10%' }}>{user?.userHandle} is not {showType} anyone yet...</h6>
                                        : displayFollow?.map((val, i) => {
                                            return (
                                                <div key={val.userId || i} className='followers-list-item'>
                                                    <ListGroup.Item className='followers-list-item'>
                                                        <a href={val.userId !== loggedInUserId ? '/profile/?_id=' + val?.userId : '/profile'}>
                                                            <Image roundedCircle thumbnail className='circle followers-avatar'
                                                                src={val?.avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
                                                                onError={({ currentTarget }) => {
                                                                    currentTarget.onerror = null; // prevents looping
                                                                    currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
                                                                }}
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
                            </InfiniteScroll>
                        </div>
                    </ListGroup>
                </Modal.Body>
            </Modal>
        </div>
    );
}
export default FollowersModal;