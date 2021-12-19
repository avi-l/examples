import React, { useEffect, useState } from 'react';
import Card from 'react-bootstrap/Card'
import './UserCard.css'
import { setUserProfileData } from '../userManagement';
import { Button, Image } from 'react-bootstrap';
import Loading from '../../shared/Loading';
import { toast } from 'react-toastify';
import { getUserComments, getUserFeedbacks, getUserReps } from '../user_api';

const UserCard = (props) => {
    const { cardUserId, loggedInUserId, action } = props
    const [isLoading, setIsLoading] = useState(true);
    const [commCount, setCommCount] = useState('');
    const [repCount, setRepCount] = useState('');
    const [feedbacks, setFeedbacks] = useState({});
    const [cardUser, setCardUser] = useState({ userId: cardUserId });
    const { userId, userHandle, avatar, followers, following, firstName, lastName } = cardUser;
    const { upCount, downCount } = feedbacks;

    useEffect(() => {
        if (cardUserId) {
            (async () => {
                const toastOptions = { autoClose: 2500, position: 'top-center' }
                try {
                    const res = await setUserProfileData(cardUserId, setCardUser, false)
                    if (!res) return toast.error(`User Not Found`, toastOptions)

                    const [reps, comms, fbs] = await Promise.allSettled([
                        getUserReps({ userId: cardUserId, countOnly: true }),
                        getUserComments({ userId: cardUserId, countOnly: true }),
                        getUserFeedbacks({ userId: cardUserId })
                    ])
                    setRepCount(reps.status === 'fulfilled' ? reps.value.data : 'NaN')
                    setCommCount(comms.status === 'fulfilled' ? comms.value.data.result : 'NaN')
                    if (fbs.status === 'fulfilled') {
                        setFeedbacks({
                            upCount: fbs.value.data.filter(F => F.deleted === 0 && F.type === 'thumbsUp').length,
                            downCount: fbs.value.data.filter(F => F.deleted === 0 && F.type === 'thumbsDn').length
                        })
                    }
                    else setFeedbacks({ upCount: 'NaN', downCount: 'NaN' })
                } catch (error) {
                    return toast.error(`Error: ${error}`, toastOptions)
                }
                finally { setIsLoading(false) }
            })();
        }
    }, [cardUserId])

    if (isLoading) {
        return (
            <Card className='user-card'>
                <Card.Body className='user-card-body'>
                    <div className='user-card-loading'><Loading /></div>
                </Card.Body>
            </Card>
        )
    }
    return (
        <Card className='user-card'>
            <Card.Body className='user-card-body'>
                <a href={'/profile/?_id=' + userId}>
                    <Image className='user-card-avatar' roundedCircle thumbnail src={avatar}
                        alt={userHandle} />
                </a>
                <Card.Text className='user-card-text-userhandle'>
                    <a href={'/profile/?_id=' + userId}>{userHandle}</a>
                </Card.Text>
                <Card.Text className='user-card-text-name'>
                    {firstName}{'  '}{lastName}
                </Card.Text>
                <Card.Text className='user-card-text-name'>
                    Followers: {followers?.length}{'  '}
                    Following: {following?.length}
                </Card.Text>
                <Card.Text className='user-card-text-name'>
                    Reputations: {repCount}{'  '}
                    Comments: {commCount}
                </Card.Text>
                <Card.Text className='user-card-text-name'>
                    Feedbacks: {'  '}
                    <i className='far fa-thumbs-up user-card-icons' />{upCount}{'  '}
                    <i className='far fa-thumbs-down user-card-icons' />{downCount}
                </Card.Text>
                {followers?.find(val => val.userId === loggedInUserId)
                    ? action && <Button
                        variant='primary'
                        className='search-users-follow-btn'
                        onClick={() => {
                            action('/users/unfollow', cardUser)
                        }}>Following</Button>
                    : action && <Button
                        variant='outline-primary'
                        className='search-users-follow-btn'
                        onClick={() => {
                            action('/users/follow', cardUser)
                        }}>Follow</Button>
                }
            </Card.Body>
        </Card>
    )
}
export default UserCard;