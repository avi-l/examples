import React, { useState, useContext } from 'react';
import storeContext from '../../stores/storeContext';
import { observer } from 'mobx-react';
import Form from 'react-bootstrap/Form';
import { followUnfollowUser, searchUsers } from './user_api';
import './SearchUsers.css'
import { Button, Image, ListGroup, OverlayTrigger, Popover } from 'react-bootstrap';
import UserCard from './profile/UserCard';
import { useHistory } from 'react-router-dom';
import { toast } from 'react-toastify';

const SearchUsers = observer(() => {
    const [searchTerm, setSearchTerm] = useState('')
    const [userDetails, setUserDetails] = useState([])
    const store = useContext(storeContext);
    const { userStore, modalStore } = store;
    const { user, profileUser, setProfileUser } = userStore;
    const { setShowStartChatModal } = modalStore;
    const history = useHistory()
    const blankAvatar = '/images/blank-profile-picture-973460_960_720.png';

    const handleClose = () =>  setShowStartChatModal(false);
    const fetchUsers = async (e) => {
        setSearchTerm(e)
        if (!userDetails.length) {
            try {
                const results = await searchUsers({ userHandle: e })
                setUserDetails(results.data.user)
            } catch (error) {
                console.log(error)
            }
        }
        if (e === '') setUserDetails([])
    }
    const followUnfollow = async (route, followee) => {
        try {
            const followeeObj = { userId: followee.userId }
            const followerObj = { userId: user.userId }
            await followUnfollowUser(route, { followee: followeeObj, follower: followerObj })
            const userToFollowUnfollowIndex = userDetails.findIndex(I => I.userId === followee.userId);
                const newUserDetailsArr = [...userDetails];
                const newProfUserFollowingArr = [...profileUser.following]
                if (route === '/users/follow') {
                    newUserDetailsArr[userToFollowUnfollowIndex].followers.splice(0, 0, { userId: user.userId })
                    if (profileUser.userId) {
                        newProfUserFollowingArr.splice(0, 0, { userId: followee.userId })
                        setProfileUser({ ...profileUser, following: newProfUserFollowingArr })
                    }
                }
                else {
                    newUserDetailsArr[userToFollowUnfollowIndex].followers.splice({ userId: user.userId })
                    if (profileUser.userId) {
                        const newFollowingArr = newProfUserFollowingArr.filter((val) => val.userId !== followee.userId)
                        setProfileUser({ ...profileUser, following: newFollowingArr })
                    }
                }
                setUserDetails(newUserDetailsArr)
        } catch (error) {
            toast.error(`${error}`, {position: 'top-center', autoClose: 2500})
        }
    }

    return (
        <>
            <Form className='search-form' >
                <Form.Group className='search-input-group'>
                    <Form.Control
                        type='username'
                        id='inputUsername'
                        className='search-form-control'
                        placeholder='Search Users'
                        value={searchTerm}
                        onChange={(e) => fetchUsers(e.target.value)} />
                </Form.Group>

                <ListGroup className='search-users-list-group search-scrollable'>
                    {userDetails.filter(F => F.userHandle.toLowerCase().includes(searchTerm.toLowerCase()))?.map((item) => {
                        return (
                            <div key={item?.userId}>
                                {item.userId !== user.userId &&
                                    <ListGroup.Item className='search-users-list-item'>
                                        <OverlayTrigger
                                            trigger={['hover', 'focus']}
                                            placement='auto'
                                            delay={{ show: 1000, hide: 1000 }}
                                            overlay={
                                                <Popover>
                                                    <UserCard
                                                        cardUserId={item.userId}
                                                        loggedInUserId={user.userId}
                                                        action={followUnfollow}
                                                    />
                                                </Popover>
                                            }>
                                            <a href={item.userId !== user.userId ? '/profile/?_id=' + item?.userId : '/profile'}
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setUserDetails([]);
                                                }}>
                                                <Image roundedCircle thumbnail className='circle search-users-avatar'
                                                    src={item?.avatar || blankAvatar}
                                                    alt={item.userHandle}
                                                />
                                                {'  '}
                                                {item?.userHandle}
                                            </a>
                                        </OverlayTrigger>
                                        {item.followers?.find(val => val.userId === user.userId)
                                            ? <Button
                                                variant='primary'
                                                className='search-users-follow-btn'
                                                onClick={() => {
                                                    followUnfollow('/users/unfollow', item)
                                                }}>Following</Button>
                                            : <Button
                                                variant='outline-primary'
                                                className='search-users-follow-btn'
                                                onClick={() => {
                                                    followUnfollow('/users/follow', item)
                                                }}>Follow</Button>
                                        }
                                        <Button variant='outline-primary'
                                            className='search-users-follow-btn'
                                            onClick={() => {
                                                history.push('/chat/?_id=' + item?.userId)
                                                handleClose();
                                            }}
                                        >Message</Button>
                                    </ListGroup.Item>
                                }
                            </div>
                        )
                    })}
                </ListGroup>
            </Form>
        </>
    );
});

export default SearchUsers;