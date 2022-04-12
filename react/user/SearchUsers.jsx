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
    const { userStore } = store;
    const { user } = userStore;
    const history = useHistory()

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
                                                    />
                                                </Popover>
                                            }>
                                            <a href={item.userId !== user.userId ? '/profile/?_id=' + item?.userId : '/profile'}
                                                onClick={() => {
                                                    setSearchTerm('');
                                                    setUserDetails([]);
                                                }}>
                                                <Image roundedCircle thumbnail className='circle search-users-avatar'
                                                    src={item?.avatar || process.env.REACT_APP_BLANK_USER_AVATAR}
                                                    onError={({ currentTarget }) => {
                                                        currentTarget.onerror = null; // prevents looping
                                                        currentTarget.src = process.env.REACT_APP_BLANK_USER_AVATAR;
                                                    }}
                                                    alt={item.userHandle}
                                                />
                                                {'  '}
                                                {item?.userHandle}
                                            </a>
                                        </OverlayTrigger>
                                        <Button variant='outline-primary'
                                        size='sm'
                                            className='search-users-follow-btn'
                                            onClick={() => history.push('/chat/?friend=' + item?.userId)}
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